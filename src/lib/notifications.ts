import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase";
import { resolveDayType, toDateString } from "@/features/weekly_pattern/utils";

// Deterministic integer ID generator for string keys (Capacitor notification IDs must be 32-bit integers)
function stringToNumericId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * 1. Create Android Notification Channels
 */
export async function setupNotificationChannels() {
    if (!Capacitor.isNativePlatform()) return;

    await LocalNotifications.createChannel({
        id: "adhan",
        name: "Prayer Times & Adhan",
        description: "Notifications for prayer times and custom reference alerts",
        importance: 5, // High importance
        visibility: 1,
        vibration: true,
    });

    await LocalNotifications.createChannel({
        id: "tasks",
        name: "Task Slot Reminders",
        description: "Reminders for scheduled tasks placed in free blocks",
        importance: 4,
        visibility: 1,
        vibration: true,
    });

    await LocalNotifications.createChannel({
        id: "reminders",
        name: "System Nudges",
        description: "Daily planning, backlog health, and weekly review nudges",
        importance: 3,
        visibility: 1,
        vibration: true,
    });
}

/**
 * 2. Request Android 13+ runtime permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    const status = await LocalNotifications.checkPermissions();
    if (status.display === "granted") return true;

    const request = await LocalNotifications.requestPermissions();
    return request.display === "granted";
}

/**
 * 3. Master Reschedule Function:
 * Cancels all pending local notifications and rebuilds them for the next 7 days.
 */
export async function rescheduleAllLocalNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // Ensure channels exist
    await setupNotificationChannels();

    // Clear existing scheduled notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notifications: LocalNotificationSchema[] = [];
    const now = new Date();

    // ── A. PRAYER / ADHAN NOTIFICATIONS (Next 7 Days) ─────────────
    const { data: prayerTimes } = await supabase.from("prayer_times").select("*");
    if (prayerTimes) {
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + dayOffset);

            for (const prayer of prayerTimes) {
                if (!prayer.notify_enabled) continue;

                const [hours, minutes] = prayer.time.split(":").map(Number);
                const fireTime = new Date(targetDate);
                fireTime.setHours(hours, minutes, 0, 0);

                // Subtract lead time minutes
                fireTime.setMinutes(fireTime.getMinutes() - prayer.notify_lead_minutes);

                if (fireTime > now) {
                    notifications.push({
                        id: stringToNumericId(`prayer-${prayer.id}-${toDateString(targetDate)}`),
                        title: prayer.name,
                        body:
                            prayer.notify_lead_minutes > 0
                                ? `${prayer.name} is in ${prayer.notify_lead_minutes} minutes.`
                                : `It is time for ${prayer.name}.`,
                        schedule: { at: fireTime },
                        channelId: "adhan",
                    });
                }
            }
        }
    }

    // ── B. TASK SLOT NOTIFICATIONS (Next 7 Days) ──────────────────
    const startDateStr = toDateString(now);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 6);
    const endDateStr = toDateString(endDate);

    const { data: assignments } = await supabase
        .from("task_assignments")
        .select("*, task:tasks(*), schedule_block:schedule_blocks(*)")
        .gte("assigned_date", startDateStr)
        .lte("assigned_date", endDateStr)
        .eq("status", "pending");

    if (assignments) {
        for (const assignment of assignments) {
            const task = assignment.task;
            const block = assignment.schedule_block;

            // Notification fires ONLY if assigned to a slot & notify_enabled is true
            if (!task || !block || !task.notify_enabled) continue;

            const [year, month, day] = assignment.assigned_date.split("-").map(Number);
            const [hours, minutes] = block.start_time.split(":").map(Number);

            const fireTime = new Date(year, month - 1, day, hours, minutes, 0);
            fireTime.setMinutes(fireTime.getMinutes() - (task.notify_lead_minutes ?? 10));

            if (fireTime > now) {
                notifications.push({
                    id: stringToNumericId(`task-${assignment.id}`),
                    title: task.title,
                    body: `Upcoming task in "${block.title}" at ${block.start_time.slice(0, 5)}.`,
                    schedule: { at: fireTime },
                    channelId: "tasks",
                });
            }
        }
    }

    // ── C. SYSTEM REMINDERS (Next 7 Days) ─────────────────────────
    const { data: reminders } = await supabase.from("reminders").select("*").eq("is_enabled", true);
    if (reminders) {
        // Fetch day types & pattern for "Plan tomorrow", and active tasks for "Stale backlog"
        const { data: pattern } = await supabase.from("weekly_pattern").select("*");
        const { data: overrides } = await supabase
            .from("day_overrides")
            .select("*")
            .gte("the_date", startDateStr)
            .lte("the_date", endDateStr);
        const { data: activeTasks } = await supabase
            .from("tasks")
            .select("id, created_at, status, type")
            .eq("status", "active");

        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + dayOffset);
            const targetDateStr = toDateString(targetDate);

            for (const reminder of reminders) {
                const [hours, minutes] = reminder.fire_time.split(":").map(Number);
                const fireTime = new Date(targetDate);
                fireTime.setHours(hours, minutes, 0, 0);

                if (fireTime <= now) continue;

                if (reminder.reminder_type === "plan_next_day") {
                    const tomorrow = new Date(targetDate);
                    tomorrow.setDate(targetDate.getDate() + 1);
                    const tomorrowStr = toDateString(tomorrow);

                    const override = overrides?.find((o) => o.the_date === tomorrowStr);
                    const resolved = resolveDayType(override, pattern ?? [], tomorrow);

                    if (!resolved.dayTypeId) {
                        notifications.push({
                            id: stringToNumericId(`reminder-plan-${targetDateStr}`),
                            title: "Plan Tomorrow",
                            body: "You haven't set a day-type for tomorrow yet.",
                            schedule: { at: fireTime },
                            channelId: "reminders",
                        });
                    }
                } else if (reminder.reminder_type === "stale_backlog") {
                    const config = (reminder.config as { idle_days_threshold?: number }) ?? {};
                    const thresholdDays = config.idle_days_threshold ?? 3;
                    const thresholdTime = targetDate.getTime() - thresholdDays * 24 * 60 * 60 * 1000;

                    // Check if any active task was created prior to the threshold
                    const hasStaleTasks = (activeTasks ?? []).some(
                        (t) => new Date(t.created_at).getTime() < thresholdTime,
                    );

                    if (hasStaleTasks) {
                        notifications.push({
                            id: stringToNumericId(`reminder-stale-${targetDateStr}`),
                            title: "Stale Backlog",
                            body: `You have tasks that have been untouched for over ${thresholdDays} days.`,
                            schedule: { at: fireTime },
                            channelId: "reminders",
                        });
                    }
                } else if (reminder.reminder_type === "weekly_summary" && targetDate.getDay() === 0 /* Sunday */) {
                    notifications.push({
                        id: stringToNumericId(`reminder-weekly-${targetDateStr}`),
                        title: "Weekly Summary",
                        body: "Review your completed tasks and plan your upcoming week.",
                        schedule: { at: fireTime },
                        channelId: "reminders",
                    });
                }
            }
        }
    }

    // Schedule all generated notifications
    if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
    }
}

/**
 * Completely wipes all pending and delivered notifications (Used on Sign Out)
 */
export async function clearAllLocalNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: pending.notifications });
        }
        await LocalNotifications.removeAllDeliveredNotifications();
    } catch (error) {
        console.error("Failed to clear local notifications on sign-out:", error);
    }
}

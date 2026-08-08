import type { TaskAssignment } from "./types";
import type { ScheduleBlock } from "@/features/day_types/types";
import { blockDurationMinutes } from "@/features/day_types/utils";

// Free blocks on a given day whose duration is enough for the task, and
// which aren't already occupied by another pending assignment that day.
// Per §7: "The app only offers free blocks whose duration >= the task's
// estimated time." §1: a recurring task can hold multiple pending
// assignments, but two DIFFERENT tasks should never land in the same slot —
// so occupied slot ids are always excluded regardless of task type.
export function getAvailableSlots(
    blocks: ScheduleBlock[],
    dayAssignments: TaskAssignment[],
    estimatedMinutes: number | null,
    excludeAssignmentId?: string,
): ScheduleBlock[] {
    const occupiedBlockIds = new Set(
        dayAssignments
            .filter((a) => a.id !== excludeAssignmentId && a.schedule_block_id && a.status === "pending")
            .map((a) => a.schedule_block_id as string),
    );

    const minDuration = estimatedMinutes ?? 0;

    return blocks
        .filter((b) => b.block_type === "free")
        .filter((b) => !occupiedBlockIds.has(b.id))
        .filter((b) => blockDurationMinutes(b) >= minDuration)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

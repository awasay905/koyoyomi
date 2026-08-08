import type { ScheduleBlock } from "./types";

export function blockDurationMinutes(block: Pick<ScheduleBlock, "start_time" | "end_time">): number {
    const [sh, sm] = block.start_time.split(":").map(Number);
    const [eh, em] = block.end_time.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
}

// "17:30:00" -> "5:30 PM"
export function formatTimeLabel12h(timeStr: string): string {
    if (!timeStr) return "";
    const [hStr, mStr] = timeStr.split(":");
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${(mStr ?? "00").padStart(2, "0")} ${period}`;
}

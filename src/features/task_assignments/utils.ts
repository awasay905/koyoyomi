import type { TaskAssignment } from "./types";
import type { ScheduleBlock } from "@/features/day_types/types";
import { blockDurationMinutes } from "@/features/day_types/utils";

// Calculate remaining time in a free block (total duration minus pending assigned tasks)
export function getBlockRemainingMinutes(
    block: ScheduleBlock,
    dayAssignments: TaskAssignment[],
    excludeAssignmentId?: string,
): number {
    const totalDuration = blockDurationMinutes(block);
    const usedMinutes = dayAssignments
        .filter((a) => a.id !== excludeAssignmentId && a.schedule_block_id === block.id && a.status === "pending")
        .reduce((sum, a) => sum + (a.task?.estimated_minutes ?? 0), 0);

    return Math.max(0, totalDuration - usedMinutes);
}

// Free blocks on a given day whose remaining duration is enough for the task
export function getAvailableSlots(
    blocks: ScheduleBlock[],
    dayAssignments: TaskAssignment[],
    estimatedMinutes: number | null,
    excludeAssignmentId?: string,
): ScheduleBlock[] {
    const minDuration = estimatedMinutes ?? 0;

    return blocks
        .filter((b) => b.block_type === "free")
        .filter((b) => getBlockRemainingMinutes(b, dayAssignments, excludeAssignmentId) >= minDuration)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function toDateString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

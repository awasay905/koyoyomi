export type BlockType = "fixed" | "free";

export interface DayType {
    id: string;
    user_id: string;
    name: string;
    color: string | null;
    is_archived: boolean;
    created_at: string;
}

export interface ScheduleBlock {
    id: string;
    user_id: string;
    day_type_id: string;
    title: string;
    block_type: BlockType;
    start_time: string; // "HH:MM:SS"
    end_time: string; // "HH:MM:SS"
    notes: string | null;
    sort_order: number;
}

export interface CreateDayTypeInput {
    name: string;
    color?: string | null;
}

export type UpdateDayTypeInput = Partial<CreateDayTypeInput> & { id: string };

export interface CreateScheduleBlockInput {
    day_type_id: string;
    title: string;
    block_type: BlockType;
    start_time: string;
    end_time: string;
    notes?: string | null;
    sort_order?: number;
}

export type UpdateScheduleBlockInput = Partial<Omit<CreateScheduleBlockInput, "day_type_id">> & { id: string };

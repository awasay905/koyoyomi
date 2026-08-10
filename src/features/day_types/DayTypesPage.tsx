import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, CalendarDays, MoreHorizontal, Pencil, Archive, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

import type { DayType } from "./types";
import { useDayTypesQuery, useArchiveDayType } from "./hooks";
import { AddDayTypeDialog } from "./AddDayTypeDialog";

export function DayTypesPage() {
    const { data: dayTypes = [], isLoading } = useDayTypesQuery();
    const archiveDayType = useArchiveDayType();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dayTypeToEdit, setDayTypeToEdit] = useState<DayType | null>(null);

    const handleOpenCreate = () => {
        setDayTypeToEdit(null);
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (dt: DayType) => {
        setDayTypeToEdit(dt);
        setIsDialogOpen(true);
    };

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8 px-4 py-8 pb-28">
            {/* Page Header (Optimized for Subtitle Width) */}
            <header className="flex items-start min-w-0">
                <div className="flex items-start gap-2 min-w-0 w-full">
                    <Link
                        to="/settings"
                        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 -ml-2 -mt-1"
                        aria-label="Back to Settings"
                    >
                        <ChevronLeft />
                    </Link>

                    <div className="flex flex-col w-full min-w-0">
                        <div className="flex items-center justify-between gap-4 min-w-0 w-full">
                            <h1 className="text-xl font-bold tracking-tight truncate leading-none">Day Templates</h1>
                            <Button size="sm" onClick={handleOpenCreate} className="shrink-0">
                                <Plus data-icon="inline-start" />
                                <span>New</span>
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1.5">
                            Build reusable schedules for your routines.
                        </p>
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    Your Templates
                </h2>

                {isLoading ? (
                    <Card className="shadow-2xs border-border/80 overflow-hidden p-0 gap-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            <Skeleton className="h-14 w-full rounded-none" />
                            <div className="h-px bg-border/50 mx-4" />
                            <Skeleton className="h-14 w-full rounded-none" />
                        </CardContent>
                    </Card>
                ) : dayTypes.length === 0 ? (
                    <Empty className="py-12 border border-dashed border-border/80 rounded-xl bg-card/40">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <CalendarDays />
                            </EmptyMedia>
                            <EmptyTitle>No templates yet</EmptyTitle>
                            <EmptyDescription className="max-w-[250px]">
                                Create your first day-type template to start building your weekly pattern.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button size="sm" variant="outline" onClick={handleOpenCreate}>
                                <Plus data-icon="inline-start" />
                                <span>Create Template</span>
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <Card className="shadow-2xs border-border/80 overflow-hidden p-0 gap-0">
                        <CardContent className="p-0 flex flex-col gap-0">
                            {dayTypes.map((dt, index) => (
                                <div key={dt.id} className="flex flex-col">
                                    <div className="group flex items-center justify-between p-2 hover:bg-accent/80 transition-colors">
                                        <Link
                                            to="/settings/day_types/$dayTypeId"
                                            params={{ dayTypeId: dt.id }}
                                            className="flex items-center gap-3 min-w-0 flex-1 px-2 py-2 focus-visible:outline-none"
                                        >
                                            <span
                                                className="size-3.5 rounded-full shrink-0 ring-1 ring-border/50"
                                                style={{ backgroundColor: dt.color ?? undefined }}
                                            />
                                            <span className="font-medium text-sm leading-tight truncate text-foreground">
                                                {dt.name}
                                            </span>
                                        </Link>

                                        <div className="flex items-center shrink-0 px-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-muted-foreground hover:text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                            aria-label={`Options for ${dt.name}`}
                                                        ></Button>
                                                    }
                                                >
                                                    <MoreHorizontal />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem onClick={() => handleOpenEdit(dt)}>
                                                            <Pencil data-icon="inline-start" />
                                                            <span>Edit template</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => archiveDayType.mutate(dt.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Archive data-icon="inline-start" />
                                                            <span>Archive</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Structural Divider */}
                                    {index < dayTypes.length - 1 && <div className="h-px bg-border/50 mx-4" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </section>

            <AddDayTypeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} dayTypeToEdit={dayTypeToEdit} />
        </div>
    );
}

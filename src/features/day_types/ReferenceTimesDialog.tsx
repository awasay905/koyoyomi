import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrayerTimes } from "@/features/prayer_times/hooks";
import { formatTimeLabel12h } from "./utils";

interface ReferenceTimesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReferenceTimesDialog({ open, onOpenChange }: ReferenceTimesDialogProps) {
    const { data: prayerTimes = [], isLoading } = usePrayerTimes();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Reference Timings</DialogTitle>
                    <DialogDescription>Prayer and reference markers to align your schedule.</DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    {isLoading ? (
                        <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                            <CardContent className="p-0 flex flex-col gap-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="p-3 px-4 flex items-center justify-between">
                                        <Skeleton className="h-4 w-24 rounded-md" />
                                        <Skeleton className="h-4 w-14 rounded-md" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : prayerTimes.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-6">No reference times configured.</p>
                    ) : (
                        <Card className="shadow-2xs border-border/80 overflow-hidden gap-0 p-0">
                            <CardContent className="p-0 flex flex-col gap-0">
                                {prayerTimes.map((prayer, index) => (
                                    <div key={prayer.id} className="flex flex-col">
                                        <div className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-sm font-medium text-foreground">{prayer.name}</span>
                                            <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
                                                {formatTimeLabel12h(prayer.time)}
                                            </span>
                                        </div>
                                        {index < prayerTimes.length - 1 && <div className="h-px bg-border/50 mx-4" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

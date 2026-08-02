// src/pages/TodayPage.tsx
export function TodayPage() {
    return (
        <div className="flex flex-col h-full">
            {/* Page header */}
            <header className="px-4 py-4 border-b border-border shrink-0">
                <h1 className="text-lg font-semibold">Today</h1>
            </header>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Two-column on desktop */}
                <div className="max-w-6xl mx-auto p-4 md:grid md:grid-cols-[1fr_340px] md:gap-6">
                    <div>{/* main content */}</div>
                    <div className="hidden md:block">{/* right panel — desktop only */}</div>
                </div>
            </div>
        </div>
    );
}

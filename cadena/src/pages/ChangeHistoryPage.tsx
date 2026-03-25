import { useState, useMemo } from "react";
import { useChangeHistory } from "@/features/employee/hooks/useChangeHistory";
import { useProfile } from "@/features/employee/hooks/useProfile";
import HistoryRecordItem from "@/features/employee/components/HistoryRecordItem";
import HistoryDetailPanel from "@/features/employee/components/HistoryDetailPanel";

export default function ChangeHistoryPage() {
  const { data: history = [], isLoading: isHistoryLoading, error } = useChangeHistory(7);
  const { data: user, isLoading: isUserLoading } = useProfile();

  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    const lowerQuery = searchQuery.toLowerCase();
    return history.filter(
      (activity) =>
        activity.action.toLowerCase().includes(lowerQuery) ||
        activity.changes.some(
          (c) =>
            c.field.toLowerCase().includes(lowerQuery) ||
            c.old_value?.toLowerCase().includes(lowerQuery) ||
            c.new_value?.toLowerCase().includes(lowerQuery)
        )
    );
  }, [history, searchQuery]);

  const selectedActivity = useMemo(
    () => history.find((a) => a.id === selectedActivityId),
    [history, selectedActivityId]
  );

  if (isHistoryLoading || isUserLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-error-container text-on-error-container p-4 rounded-xl">
          <h3 className="font-bold">Error loading history</h3>
          <p className="text-sm">Failed to load change history. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Left Side: History List */}
      <section
        className={`flex flex-col bg-surface-container-low overflow-hidden transition-all duration-300 ${
          selectedActivity ? "w-full lg:w-[65%]" : "w-full"
        }`}
      >
        {/* Search & Filters */}
        <div className="px-6 lg:px-10 pt-10 pb-6 flex flex-col gap-6">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
                Change History
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Audit log of recent profile modifications.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Filter by
              </span>
              <div className="flex gap-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary-container text-on-secondary-container cursor-pointer hover:bg-surface-container-highest transition-colors">
                  Past 7 Days
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-surface-container-high text-on-surface-variant cursor-pointer hover:bg-surface-container-highest transition-colors">
                  Profile
                </span>
              </div>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-highest border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline outline-none"
              placeholder="Search by action or field..."
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-10 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">
                history_toggle_off
              </span>
              <p className="text-on-surface-variant font-medium">No history records found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((activity) => (
                <HistoryRecordItem
                  key={activity.id}
                  activity={activity}
                  user={user}
                  isSelected={selectedActivityId === activity.id}
                  onClick={() =>
                    setSelectedActivityId(
                      selectedActivityId === activity.id ? null : activity.id
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Right Side: Detail Panel */}
      {selectedActivity && (
        <HistoryDetailPanel
          activity={selectedActivity}
          user={user}
          onClose={() => setSelectedActivityId(null)}
        />
      )}
    </div>
  );
}

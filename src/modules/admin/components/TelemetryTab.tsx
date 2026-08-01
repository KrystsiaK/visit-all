"use client";

import { useState, useTransition, useEffect } from "react";
import { OutlineButton, DestructiveActionDialog } from "@synarava/ui-kit";
import { LiquidGlassSurface } from "@synarava/liquid-glass";
import { BaseShell } from "@synarava/shell-kit";
import { Search, Trash2, RefreshCw, ChevronLeft, ChevronRight, Eye, AlertCircle, Loader } from "lucide-react";
import { getTelemetryLogs, clearTelemetryLogs } from "../actions";

interface TelemetryLog {
  id: string;
  event_type: string;
  metadata: any;
  created_at: Date;
  user_email: string | null;
}

interface TelemetryTabProps {
  initialLogsData: {
    logs: TelemetryLog[];
    totalCount: number;
    totalPages: number;
  };
  currentUserRole: string;
}

export function TelemetryTab({ initialLogsData, currentUserRole }: TelemetryTabProps) {
  const [logs, setLogs] = useState<TelemetryLog[]>(initialLogsData.logs);
  const [totalCount, setTotalCount] = useState(initialLogsData.totalCount);
  const [totalPages, setTotalPages] = useState(initialLogsData.totalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Active selected log for details drawer
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);

  // Clear confirmation dialog state
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLogs = (page: number, search: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await getTelemetryLogs(page, search);
        setLogs(res.logs);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
        setCurrentPage(page);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to fetch telemetry logs.");
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1, searchTerm);
  };

  const handleRefresh = () => {
    fetchLogs(currentPage, searchTerm);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchLogs(page, searchTerm);
  };

  const handleClearConfirm = async () => {
    setIsClearing(true);
    try {
      const res = await clearTelemetryLogs();
      if (res.ok) {
        setLogs([]);
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
        setIsClearDialogOpen(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to clear logs.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Search & Actions Panel */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone="neutral"
        effect="default"
        className="p-5 rounded-[24px] border border-black/5 bg-white/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search event type, user email or payload metadata..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white/80 border border-black/10 rounded-xl focus:outline-none focus:border-neutral-500 transition-colors shadow-2xs font-medium placeholder-neutral-450"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </div>
          <OutlineButton type="submit" fullWidth={false} className="py-2.5 px-4 h-10 border border-black/10">
            Search
          </OutlineButton>
        </form>

        <div className="flex items-center gap-2">
          <OutlineButton onClick={handleRefresh} fullWidth={false} className="py-2 px-3.5 h-10 border border-black/10">
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
          </OutlineButton>
          
          {currentUserRole === "superadmin" && (
            <button
              onClick={() => setIsClearDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#b7102a]/20 bg-white px-4 py-2.5 h-10 text-xs font-black uppercase tracking-[0.18em] text-[#b7102a] transition-all hover:bg-[#b7102a]/5 active:scale-98 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Logs
            </button>
          )}
        </div>
      </LiquidGlassSurface>

      {errorMsg && (
        <div className="bg-[#b7102a]/10 border border-[#b7102a]/15 text-[#b7102a] text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {/* Logs Table */}
      <LiquidGlassSurface
        variant="frosted-glass"
        tone="neutral"
        effect="default"
        className="p-5 rounded-[24px] border border-black/5 bg-white/60 shadow-xs flex flex-col gap-4"
      >
        <div className="w-full overflow-x-auto border border-black/5 rounded-2xl bg-white/50">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 bg-black/[0.02] font-black uppercase text-neutral-500 tracking-wider">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">User Account</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500 italic">
                    {isPending ? "Loading activities..." : "No telemetry logs recorded."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-500">
                      {new Date(log.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-800">
                      <span className="font-mono bg-black/4 px-2 py-0.5 rounded text-[10px]">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-600 font-mono">
                      {log.user_email || <span className="text-neutral-400 italic">Anonymous</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:text-neutral-900 border border-black/10 hover:bg-black/4 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 pt-4">
            <span className="text-xs text-neutral-500 font-medium">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} entries)
            </span>
            <div className="flex items-center gap-1.5">
              <OutlineButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                fullWidth={false}
                className="py-1.5 px-3 h-8 border border-black/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </OutlineButton>
              <OutlineButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                fullWidth={false}
                className="py-1.5 px-3 h-8 border border-black/10"
              >
                <ChevronRight className="w-4 h-4" />
              </OutlineButton>
            </div>
          </div>
        )}
      </LiquidGlassSurface>

      {/* Log Inspector Drawer SidePanel */}
      <BaseShell
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Telemetry Log Inspector"
        subtitle={selectedLog?.event_type || ""}
        closeLabel="Close"
        placement="right"
        showBackdrop={true}
        showHeader={true}
        glassVariant="frosted-glass"
        glassTone="neutral"
        glassEffect="amplified"
        shellClassName="fixed right-0 top-0 bottom-0 z-[1000] w-full max-w-[460px] shadow-2xl h-screen bg-[#f8f6f1]"
      >
        {selectedLog && (
          <div className="flex flex-col gap-5 p-4 text-xs">
            <div className="bg-white/60 border border-black/5 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Log UID</span>
                <p className="font-mono text-neutral-800 break-all select-all font-semibold">{selectedLog.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Created At</span>
                  <p className="font-medium text-neutral-700">
                    {new Date(selectedLog.created_at).toLocaleString("en-US")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">User Context</span>
                  <p className="font-semibold text-neutral-800 truncate">
                    {selectedLog.user_email || "Anonymous Session"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase text-neutral-450 tracking-wider">Event Payload Metadata</span>
              <pre className="flex-1 min-h-[200px] w-full overflow-auto bg-neutral-900 text-neutral-200 font-mono p-4 rounded-2xl shadow-inner border border-black/15 select-all leading-relaxed text-[11px]">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </BaseShell>

      {/* Clear Logs Confirmation Modal */}
      <DestructiveActionDialog
        open={isClearDialogOpen}
        saving={isClearing}
        eyebrow="Critical Purge Operation"
        title="Clear All Telemetry logs?"
        description="This will permanently delete all logged user activities and analytics events from the database. This action is irreversible."
        confirmLabel="Purge logs"
        pendingLabel="Purging..."
        onCancel={() => setIsClearDialogOpen(false)}
        onConfirm={handleClearConfirm}
      />

    </div>
  );
}

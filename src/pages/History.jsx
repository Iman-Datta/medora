import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, XCircle, Clock, Pill } from "lucide-react";
import toast from "react-hot-toast";
import { medicineApi } from "@/services/api";
import Spinner from "@/components/Spinner";

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicineApi
      .getHistory()
      .then((res) => {
        const historyData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setLogs(historyData);
      })
      .catch((err) =>
        toast.error(err.normalizedMessage || "Failed to load history"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-brand-600">
        <Spinner size={40} />
      </div>
    );
  }

  // Group history logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-600" />
            Medication History
          </h1>
          <p className="text-slate-500 mt-1">
            Track your past medication compliance.
          </p>
        </div>
      </div>

      {Object.keys(groupedLogs).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-medium text-slate-700">No logs found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Dose actions will appear here as you record them.
          </p>
        </div>
      ) : (
        Object.entries(groupedLogs).map(([date, entries]) => (
          <div key={date} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </h2>

            <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 shadow-sm overflow-hidden">
              {entries.map((item, idx) => (
                <div
                  key={`${item.medicineId}-${item.scheduleId}-${idx}`}
                  className="flex items-center justify-between p-4 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {item.medicineName}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.dose || item.dosage} • {item.time}
                      </p>
                    </div>
                  </div>

                  <div>
                    {item.status === "taken" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Taken
                      </span>
                    ) : item.status === "skipped" ? (
                      <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Skipped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

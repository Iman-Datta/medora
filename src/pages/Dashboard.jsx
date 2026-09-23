import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill, AlertTriangle, Clock, CheckCircle2, XCircle, Sunrise, Sun, Moon,
  Plus, Package, Activity, CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { medicineApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getTimeIcon(time) {
  const hour = parseInt(time?.split(':')[0] || '12', 10);
  if (hour < 12) return Sunrise;
  if (hour < 18) return Sun;
  return Moon;
}

function timeBand(time) {
  const hour = parseInt(time?.split(':')[0] || '12', 10);
  if (hour < 12) return { label: 'Morning', icon: Sunrise, color: 'text-amber-500 bg-amber-50' };
  if (hour < 18) return { label: 'Afternoon', icon: Sun, color: 'text-orange-500 bg-orange-50' };
  return { label: 'Evening', icon: Moon, color: 'text-indigo-500 bg-indigo-50' };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    Promise.all([medicineApi.getAll(), medicineApi.getLowStock()])
      .then(([medsRes, lowRes]) => {
        setMedicines(medsRes.data || []);
        setLowStock(lowRes.data || []);
      })
      .catch((err) => toast.error(err.normalizedMessage || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  // Build today's timeline from all medicine schedules
  const todayTimeline = useMemo(() => {
    const entries = [];
    medicines.forEach((med) => {
      (med.schedules || []).forEach((sched) => {
        entries.push({ medicine: med, schedule: sched });
      });
    });
    return entries.sort((a, b) =>
      (a.schedule.time || '').localeCompare(b.schedule.time || '')
    );
  }, [medicines]);

  const activeCount = medicines.length;
  const pendingToday = todayTimeline.filter(
    (e) => e.schedule.status !== 'taken' && e.schedule.status !== 'skipped'
  ).length;
  const lowStockCount = lowStock.length;

  const handleDoseAction = async (med, sched, status) => {
    setUpdatingId(`${med._id}-${sched._id}`);
    try {
      await medicineApi.updateDoseStatus(med._id, sched._id, {
        status,
        date: todayStr(),
      });
      // Update local state
      setMedicines((prev) =>
        prev.map((m) =>
          m._id === med._id
            ? {
                ...m,
                schedules: m.schedules.map((s) =>
                  s._id === sched._id ? { ...s, status } : s
                ),
              }
            : m
        )
      );
      toast.success(status === 'taken' ? 'Dose marked as taken' : 'Dose skipped');
    } catch (err) {
      toast.error(err.normalizedMessage || 'Failed to update dose status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-brand-600">
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          to="/medicines/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-base shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add medication
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={Pill}
          label="Active medications"
          value={activeCount}
          color="brand"
        />
        <SummaryCard
          icon={Clock}
          label="Pending doses today"
          value={pendingToday}
          color="amber"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Low stock warnings"
          value={lowStockCount}
          color="red"
          highlight={lowStockCount > 0}
        />
      </div>

      {/* Low stock banner */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Low stock alerts</h3>
              <p className="text-sm text-red-700 mt-0.5">
                {lowStockCount} {lowStockCount === 1 ? 'medicine needs' : 'medicines need'} restocking soon.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {lowStock.slice(0, 4).map((med) => (
                  <span
                    key={med._id}
                    className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-700 text-xs font-medium px-2.5 py-1 rounded-lg"
                  >
                    <Package className="w-3.5 h-3.5" />
                    {med.name} — {med.currentStock} left
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-600" />
            Today's schedule
          </h2>
          <span className="text-sm text-slate-400">{todayTimeline.length} doses</span>
        </div>

        {todayTimeline.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-medium text-slate-700">No doses scheduled for today</h3>
            <p className="text-sm text-slate-400 mt-1">Add a medication to start tracking your schedule.</p>
            <Link
              to="/medicines/new"
              className="inline-flex items-center gap-2 mt-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-base"
            >
              <Plus className="w-4 h-4" /> Add medication
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todayTimeline.map(({ medicine: med, schedule: sched }) => {
              const band = timeBand(sched.time);
              const BandIcon = band.icon;
              const isTaken = sched.status === 'taken';
              const isSkipped = sched.status === 'skipped';
              const idKey = `${med._id}-${sched._id}`;

              return (
                <div
                  key={idKey}
                  className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/50 transition-base"
                >
                  {/* Time badge */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${band.color} flex items-center justify-center`}>
                      <BandIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 mt-1.5">{sched.time}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isTaken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {med.name}
                    </p>
                    <p className="text-sm text-slate-400 truncate">
                      {sched.dose || med.dosage} — {med.instructions || 'Anytime'}
                    </p>
                  </div>

                  {/* Status / actions */}
                  {isTaken ? (
                    <span className="flex items-center gap-1.5 text-brand-600 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5" /> Taken
                    </span>
                  ) : isSkipped ? (
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                      <XCircle className="w-5 h-5" /> Skipped
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDoseAction(med, sched, 'skipped')}
                        disabled={updatingId === idKey}
                        className="w-9 h-9 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-base disabled:opacity-50"
                        title="Skip dose"
                      >
                        {updatingId === idKey ? <Spinner size={16} /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDoseAction(med, sched, 'taken')}
                        disabled={updatingId === idKey}
                        className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-base disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Take
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function SummaryCard({ icon: Icon, label, value, color, highlight }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-base ${
        highlight ? 'border-red-200 shadow-md shadow-red-50' : 'border-slate-100 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-3xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="text-sm text-slate-500 mt-3">{label}</p>
    </div>
  );
}

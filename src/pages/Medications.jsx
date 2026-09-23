import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pill,
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Clock,
  FileText,
  AlertTriangle,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import { medicineApi } from "@/services/api";
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

const formColors = {
  Tablet: "bg-blue-50 text-blue-700 border-blue-200",
  Capsule: "bg-purple-50 text-purple-700 border-purple-200",
  Syrup: "bg-pink-50 text-pink-700 border-pink-200",
  Injection: "bg-red-50 text-red-700 border-red-200",
  Drops: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Ointment: "bg-amber-50 text-amber-700 border-amber-200",
  Other: "bg-slate-100 text-slate-600 border-slate-200",
};

const instructionColors = {
  "Before Food": "bg-orange-50 text-orange-700",
  "After Food": "bg-brand-50 text-brand-700",
  "With Food": "bg-teal-50 text-teal-700",
  Anytime: "bg-slate-100 text-slate-600",
};

export default function Medications() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMedicines = () => {
    setLoading(true);
    medicineApi
      .getAll()
      .then((res) => {
        // Safely extract the medicines array regardless of API payload wrapper shape
        const medsArray = Array.isArray(res.data)
          ? res.data
          : res.data?.medicines || res.data?.data || [];

        setMedicines(medsArray);
      })
      .catch((err) =>
        toast.error(err.normalizedMessage || "Failed to load medications"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(loadMedicines, []);

  // Safe fallback to prevent crash if medicines state is ever non-array
  const medList = Array.isArray(medicines) ? medicines : [];

  const filtered = medList.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await medicineApi.delete(deleteTarget._id);
      setMedicines((prev) =>
        Array.isArray(prev)
          ? prev.filter((m) => m._id !== deleteTarget._id)
          : [],
      );
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.normalizedMessage || "Failed to delete medicine");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medications</h1>
          <p className="text-slate-500 mt-1">
            {medList.length} saved{" "}
            {medList.length === 1 ? "medicine" : "medicines"}
          </p>
        </div>
        <Link
          to="/medicines/new"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-base shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add medication
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medications by name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-base"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-brand-600">
          <Spinner size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-medium text-slate-700">
            {search ? "No medications found" : "No medications yet"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {search
              ? "Try a different search term."
              : "Add your first medication to get started."}
          </p>
          {!search && (
            <Link
              to="/medicines/new"
              className="inline-flex items-center gap-2 mt-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-base"
            >
              <Plus className="w-4 h-4" /> Add medication
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((med) => {
            const isLowStock = med.currentStock <= med.reorderLevel;
            return (
              <div
                key={med._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-base group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {med.name}
                      </h3>
                      <p className="text-sm text-slate-400">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-base">
                    <Link
                      to={`/medicines/${med._id}/edit`}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 flex items-center justify-center transition-base"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(med)}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-base"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    label={med.form}
                    className={formColors[med.form] || formColors.Other}
                  />
                  <Badge
                    label={med.instructions}
                    className={
                      instructionColors[med.instructions] ||
                      instructionColors.Anytime
                    }
                  />
                  <Badge
                    label={med.frequency}
                    className="bg-slate-100 text-slate-600"
                    icon={Layers}
                  />
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Stock:{" "}
                    <span
                      className={`font-medium ${isLowStock ? "text-red-600" : "text-slate-700"}`}
                    >
                      {med.currentStock}
                    </span>
                    <span className="text-slate-400">
                      {" "}
                      / reorder at {med.reorderLevel}
                    </span>
                  </span>
                  {isLowStock && (
                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Low
                    </span>
                  )}
                </div>

                {/* Schedules */}
                {(med.schedules || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {med.schedules.map((s, i) => (
                      <span
                        key={s._id || i}
                        className="inline-flex items-center gap-1 text-xs font-medium bg-slate-50 text-slate-600 px-2 py-1 rounded-lg"
                      >
                        <Clock className="w-3 h-3" /> {s.time}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {med.notes && (
                  <div className="flex items-start gap-2 pt-3 border-t border-slate-50">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {med.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete medication"
        maxWidth="max-w-sm"
      >
        <p className="text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">
            {deleteTarget?.name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setDeleteTarget(null)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-base"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-base disabled:opacity-60"
          >
            {deleting ? (
              <Spinner size={18} />
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Delete
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Badge({ label, className = "", icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}

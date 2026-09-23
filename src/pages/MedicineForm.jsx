import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { medicineApi } from "@/services/api";
import Spinner from "@/components/Spinner";

const FORM_OPTIONS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Drops",
  "Ointment",
  "Other",
];
const INSTRUCTION_OPTIONS = [
  "Before Food",
  "After Food",
  "With Food",
  "Anytime",
];
const FREQUENCY_OPTIONS = ["Daily", "Specific Days", "As Needed (PRN)"];

const emptyForm = {
  name: "",
  dosage: "",
  form: "Tablet",
  instructions: "After Food",
  frequency: "Daily",
  currentStock: "",
  reorderLevel: "",
  notes: "",
  schedules: [{ time: "08:00", dose: "1 tablet" }],
};

export default function MedicineForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    setLoading(true);
    medicineApi
      .getById(id)
      .then((res) => {
        // Safely unwrap data whether backend sends res.data, res.data.data, or res.data.medicine
        const med = res.data?.data || res.data?.medicine || res.data;

        if (!med || typeof med !== "object") {
          throw new Error("Invalid medication data received");
        }

        setForm({
          name: med.name || "",
          dosage: med.dosage || "",
          form: med.form || "Tablet",
          instructions: med.instructions || "After Food",
          frequency: med.frequency || "Daily",
          currentStock:
            med.currentStock !== undefined && med.currentStock !== null
              ? med.currentStock
              : "",
          reorderLevel:
            med.reorderLevel !== undefined && med.reorderLevel !== null
              ? med.reorderLevel
              : "",
          notes: med.notes || "",
          schedules:
            Array.isArray(med.schedules) && med.schedules.length > 0
              ? med.schedules.map((s) => ({
                  time: s.time || "08:00",
                  dose: s.dose || "1 tablet",
                }))
              : [{ time: "08:00", dose: "1 tablet" }],
        });
      })
      .catch((err) => {
        toast.error(
          err.normalizedMessage ||
            err.message ||
            "Failed to load medicine details",
        );
        navigate("/medicines");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addSchedule = () =>
    setForm((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { time: "12:00", dose: "1 tablet" }],
    }));

  const removeSchedule = (idx) =>
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== idx),
    }));

  const updateSchedule = (idx, field, value) =>
    setForm((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s,
      ),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      currentStock: form.currentStock === "" ? 0 : Number(form.currentStock),
      reorderLevel: form.reorderLevel === "" ? 0 : Number(form.reorderLevel),
    };

    try {
      if (isEdit) {
        await medicineApi.update(id, payload);
        toast.success("Medication updated successfully");
      } else {
        await medicineApi.create(payload);
        toast.success("Medication added successfully");
      }
      navigate("/medicines");
    } catch (err) {
      toast.error(err.normalizedMessage || "Failed to save medication");
    } finally {
      setSaving(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        to="/medicines"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-base"
      >
        <ArrowLeft className="w-4 h-4" /> Back to medications
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit medication" : "Add medication"}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEdit
            ? "Update the details below"
            : "Fill in the details to start tracking this medicine"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6"
      >
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" required>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Paracetamol"
              className={inputClass}
            />
          </Field>

          <Field label="Dosage">
            <input
              type="text"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="e.g. 500 mg"
              className={inputClass}
            />
          </Field>

          <Field label="Form">
            <select
              name="form"
              value={form.form}
              onChange={handleChange}
              className={inputClass}
            >
              {FORM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Instructions">
            <select
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              className={inputClass}
            >
              {INSTRUCTION_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Frequency">
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className={inputClass}
            >
              {FREQUENCY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Current stock">
              <input
                type="number"
                name="currentStock"
                min="0"
                value={form.currentStock}
                onChange={handleChange}
                placeholder="0"
                className={inputClass}
              />
            </Field>

            <Field label="Reorder at">
              <input
                type="number"
                name="reorderLevel"
                min="0"
                value={form.reorderLevel}
                onChange={handleChange}
                placeholder="5"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            placeholder="Additional notes, side effects, etc."
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* Schedules */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">
              Schedule times
            </label>
            <button
              type="button"
              onClick={addSchedule}
              className="flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700 transition-base"
            >
              <Plus className="w-4 h-4" /> Add time
            </button>
          </div>

          <div className="space-y-2">
            {form.schedules.map((sched, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="time"
                  value={sched.time}
                  onChange={(e) => updateSchedule(idx, "time", e.target.value)}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="text"
                  value={sched.dose}
                  onChange={(e) => updateSchedule(idx, "dose", e.target.value)}
                  placeholder="e.g. 1 tablet"
                  className={`${inputClass} flex-1`}
                />
                {form.schedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSchedule(idx)}
                    className="w-10 h-10 shrink-0 rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-base"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            to="/medicines"
            className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-base"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-xl transition-base disabled:opacity-60"
          >
            {saving ? (
              <Spinner size={20} />
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEdit ? "Update" : "Save"}{" "}
                medication
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-base bg-white";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

import { useState, useRef, useCallback } from "react";
import {
  ScanLine,
  UploadCloud,
  FileText,
  X,
  Check,
  Pencil,
  Save,
  Sparkles,
  Plus,
  Pill,
} from "lucide-react";
import toast from "react-hot-toast";
import { prescriptionApi, medicineApi } from "@/services/api";
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

export default function Prescriptions() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedMeds, setParsedMeds] = useState([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [savingBulk, setSavingBulk] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];
    if (!validTypes.includes(f.type)) {
      toast.error("Please upload a PNG, JPG, or PDF file");
      return;
    }
    setFile(f);
    setParsedMeds([]);
    setHasParsed(false);
    if (f.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    setHasParsed(false);
    try {
      const res = await prescriptionApi.parse(file);

      const meds = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.medicines)
          ? res.data.medicines
          : Array.isArray(res.data)
            ? res.data
            : [];

      if (meds.length === 0) {
        toast.error("No medications detected in this prescription");
      } else {
        const normalized = meds.map((m) => ({
          name: m.name || "",
          dosage: m.dosage || "",
          form: m.form || "Tablet",
          instructions: m.instructions || "After Food",
          frequency: m.frequency || "Daily",
          currentStock: m.currentStock ?? 10,
          reorderLevel: m.reorderLevel ?? 5,
          notes: m.notes || "",
          schedules: (m.schedules || []).length
            ? m.schedules
            : [{ time: "08:00", dose: "1 tablet" }],
        }));
        setParsedMeds(normalized);
        setHasParsed(true);
        toast.success(
          `Found ${normalized.length} medication${normalized.length === 1 ? "" : "s"}`,
        );
      }
    } catch (err) {
      toast.error(
        err.normalizedMessage || err.message || "Failed to parse prescription",
      );
    } finally {
      setParsing(false);
    }
  };

  const updateParsedMed = (idx, field, value) =>
    setParsedMeds((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );

  const removeParsedMed = (idx) =>
    setParsedMeds((prev) => prev.filter((_, i) => i !== idx));

  const addParsedMed = () =>
    setParsedMeds((prev) => [
      ...prev,
      {
        name: "",
        dosage: "",
        form: "Tablet",
        instructions: "After Food",
        frequency: "Daily",
        currentStock: 10,
        reorderLevel: 5,
        notes: "",
        schedules: [{ time: "08:00", dose: "1 tablet" }],
      },
    ]);

  const handleBulkSave = async () => {
    const valid = parsedMeds.filter((m) => m.name.trim());
    if (valid.length === 0) {
      toast.error("Add at least one medication with a name");
      return;
    }
    setSavingBulk(true);
    try {
      if (medicineApi.bulkCreate) {
        await medicineApi.bulkCreate(valid);
      } else {
        // Fallback: save individually if bulk endpoint is not available
        await Promise.all(valid.map((med) => medicineApi.create(med)));
      }
      toast.success(
        `${valid.length} medication${valid.length === 1 ? "" : "s"} saved`,
      );
      resetAll();
    } catch (err) {
      toast.error(err.normalizedMessage || "Failed to save medications");
    } finally {
      setSavingBulk(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreviewUrl(null);
    setParsedMeds([]);
    setHasParsed(false);
    setEditingIdx(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-brand-600" />
          Scan Prescription
        </h1>
        <p className="text-slate-500 mt-1">
          Upload a prescription image or PDF — our AI extracts medications for
          you.
        </p>
      </div>

      {/* Upload zone */}
      {!hasParsed && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-base ${
              dragActive
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,application/pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <div className="space-y-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Prescription preview"
                    className="max-h-48 mx-auto rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-red-500" />
                  </div>
                )}
                <p className="font-medium text-slate-700">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">
                    Drop your prescription here
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    or click to browse — PNG, JPG, or PDF
                  </p>
                </div>
              </div>
            )}
          </div>

          {file && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-base"
              >
                <X className="w-4 h-4" /> Remove
              </button>
              <button
                onClick={handleParse}
                disabled={parsing}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2.5 rounded-xl transition-base disabled:opacity-60"
              >
                {parsing ? (
                  <Spinner size={20} />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Scan with AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Processing animation */}
          {parsing && (
            <div className="mt-8 flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
                  <ScanLine className="w-10 h-10 text-brand-600" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-brand-400 animate-pulse-ring" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700">
                  AI is reading your prescription...
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Extracting medication names, dosages, and instructions
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parsed results */}
      {hasParsed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Extracted medications
                </h2>
                <p className="text-sm text-slate-400">
                  Review and edit before saving
                </p>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-base"
            >
              Scan another
            </button>
          </div>

          {parsedMeds.map((med, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-scale-in"
            >
              {/* Collapsed view */}
              {editingIdx !== idx ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                      <Pill className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {med.name || "Unnamed"}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {med.dosage} — {med.form} — {med.instructions}
                      </p>
                      {(med.schedules || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {med.schedules.map((s, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                            >
                              {s.time} · {s.dose}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingIdx(idx)}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 flex items-center justify-center transition-base"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeParsedMed(idx)}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-base"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Expanded edit view */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">
                      Edit medication #{idx + 1}
                    </h3>
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700 transition-base"
                    >
                      <Check className="w-4 h-4" /> Done
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ParsedField label="Name">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) =>
                          updateParsedMed(idx, "name", e.target.value)
                        }
                        className={inp}
                      />
                    </ParsedField>
                    <ParsedField label="Dosage">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) =>
                          updateParsedMed(idx, "dosage", e.target.value)
                        }
                        className={inp}
                      />
                    </ParsedField>
                    <ParsedField label="Form">
                      <select
                        value={med.form}
                        onChange={(e) =>
                          updateParsedMed(idx, "form", e.target.value)
                        }
                        className={inp}
                      >
                        {FORM_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </ParsedField>
                    <ParsedField label="Instructions">
                      <select
                        value={med.instructions}
                        onChange={(e) =>
                          updateParsedMed(idx, "instructions", e.target.value)
                        }
                        className={inp}
                      >
                        {INSTRUCTION_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </ParsedField>
                    <ParsedField label="Frequency">
                      <select
                        value={med.frequency}
                        onChange={(e) =>
                          updateParsedMed(idx, "frequency", e.target.value)
                        }
                        className={inp}
                      >
                        {FREQUENCY_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </ParsedField>
                    <div className="grid grid-cols-2 gap-2">
                      <ParsedField label="Stock">
                        <input
                          type="number"
                          value={med.currentStock}
                          onChange={(e) =>
                            updateParsedMed(idx, "currentStock", e.target.value)
                          }
                          className={inp}
                        />
                      </ParsedField>
                      <ParsedField label="Reorder">
                        <input
                          type="number"
                          value={med.reorderLevel}
                          onChange={(e) =>
                            updateParsedMed(idx, "reorderLevel", e.target.value)
                          }
                          className={inp}
                        />
                      </ParsedField>
                    </div>
                  </div>
                  <ParsedField label="Notes">
                    <textarea
                      rows={2}
                      value={med.notes}
                      onChange={(e) =>
                        updateParsedMed(idx, "notes", e.target.value)
                      }
                      className={`${inp} resize-none`}
                    />
                  </ParsedField>
                </div>
              )}
            </div>
          ))}

          {/* Add more + bulk save */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={addParsedMed}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 font-medium hover:border-brand-300 hover:text-brand-600 transition-base"
            >
              <Plus className="w-4 h-4" /> Add another
            </button>
            <button
              onClick={handleBulkSave}
              disabled={savingBulk}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-2.5 rounded-xl transition-base disabled:opacity-60"
            >
              {savingBulk ? (
                <Spinner size={20} />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save all to medications
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inp =
  "w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-base bg-white";

function ParsedField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

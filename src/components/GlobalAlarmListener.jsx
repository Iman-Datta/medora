import { useState, useEffect, useRef, useCallback } from "react";
import { AlertOctagon, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { medicineApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function GlobalAlarmListener() {
  const { user } = useAuth();
  const [activeAlarm, setActiveAlarm] = useState(null);
  const audioRef = useRef(null);
  const processedRemindersRef = useRef(new Set());

  useEffect(() => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3",
    );
    audio.loop = true;
    audioRef.current = audio;
  }, []);

  const startAlarmSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    if ("vibrate" in navigator) {
      navigator.vibrate([500, 300, 500, 300, 500]);
    }
  }, []);

  const stopAlarmSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  const fireAlarm = useCallback(
    (medName, dosage, instructions) => {
      setActiveAlarm({
        id: `${Date.now()}_${Math.random()}`,
        medName,
        dosage,
        instructions,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      startAlarmSound();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`⏰ ALARM: Time to take ${medName}!`, {
          body: `${dosage || "1 dose"} (${instructions || "After Food"})`,
          icon: "/favicon.svg",
          tag: "medora-alarm",
          requireInteraction: true,
        });
      }
    },
    [startAlarmSound],
  );

  const dismissAlarm = () => {
    stopAlarmSound();
    setActiveAlarm(null);
    toast.success("Alarm dismissed");
  };

  const checkDueReminders = useCallback(async () => {
    if (!user) return; // Skip polling if user is not authenticated

    try {
      const res = await medicineApi.getAll();
      const medsArray = Array.isArray(res.data)
        ? res.data
        : res.data?.medicines || res.data?.data || [];

      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5); // e.g., "14:30"
      const dateKey = now.toISOString().slice(0, 10); // e.g., "2026-09-24"

      medsArray.forEach((med) => {
        if (!med.schedules) return;
        med.schedules.forEach((sched) => {
          if (sched.time === currentHHMM) {
            const reminderId = `${med._id}_${sched._id || sched.time}_${dateKey}_${currentHHMM}`;
            if (!processedRemindersRef.current.has(reminderId)) {
              processedRemindersRef.current.add(reminderId);
              fireAlarm(med.name, med.dosage, med.instructions);
            }
          }
        });
      });
    } catch (err) {
      console.error("Global polling error:", err);
    }
  }, [user, fireAlarm]);

  useEffect(() => {
    if (!user) return;
    checkDueReminders();
    const interval = setInterval(checkDueReminders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user, checkDueReminders]);

  if (!activeAlarm) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-red-100 space-y-6 animate-bounce-short">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 animate-pulse">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Medicine Alarm • {activeAlarm.time}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-3">
            {activeAlarm.medName}
          </h2>
          <p className="text-slate-600 font-medium text-lg mt-1">
            {activeAlarm.dosage}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Instruction: {activeAlarm.instructions}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={dismissAlarm}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-lg shadow-brand-200 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-6 h-6" /> I Took My Dose (Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell,
  BellRing,
  Smartphone,
  Info,
  RefreshCw,
  Volume2,
  VolumeX,
  Activity,
  AlertOctagon,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { authApi, medicineApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";

export default function Notifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default",
  );
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // Active alarm modal state
  const [activeAlarm, setActiveAlarm] = useState(null);

  const audioRef = useRef(null);
  const processedRemindersRef = useRef(new Set());

  // Initialize looping alarm audio (loud alarm siren sound)
  useEffect(() => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3", // Loud alarm tone
    );
    audio.loop = true; // Continuous loop like a real alarm clock
    audioRef.current = audio;
  }, []);

  // Unlock browser audio policy on first user interaction
  const unlockAudio = useCallback(() => {
    if (audioRef.current && !isAudioUnlocked) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsAudioUnlocked(true);
        })
        .catch(() => {});
    }
  }, [isAudioUnlocked]);

  useEffect(() => {
    window.addEventListener("click", unlockAudio, { once: true });
    return () => window.removeEventListener("click", unlockAudio);
  }, [unlockAudio]);

  // Start continuous alarm audio + vibration
  const startAlarmSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.warn("Audio playback blocked by browser policy:", err);
    });

    // Vibrate device if supported (Pattern: Vibrate 500ms, pause 300ms, repeat)
    if ("vibrate" in navigator) {
      navigator.vibrate([500, 300, 500, 300, 500, 300, 500]);
    }
  }, [soundEnabled]);

  // Stop continuous alarm sound
  const stopAlarmSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  // Helper: Desktop Native Popup
  const triggerNativeNotification = useCallback((title, options = {}) => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, {
        icon: "/Logo.png",
        tag: "medora-alarm",
        requireInteraction: true, // Stays on screen until user interacts
        ...options,
      });
    }
  }, []);

  // Trigger Full Alarm Modal & Loud Ringtone
  const fireAlarm = useCallback(
    (medName, dosage, instructions) => {
      const title = `⏰ ALARM: Time to take ${medName}!`;
      const body = `${dosage || "1 dose"} (${instructions || "After Food"})`;

      // 1. Show Full-screen Alarm Overlay
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

      // 2. Play Looping Audio + Vibrate
      startAlarmSound();

      // 3. Trigger Browser Desktop Notification
      triggerNativeNotification(title, { body });

      // 4. Append to Session Log
      setRecentNotifications((prev) => [
        {
          id: `${Date.now()}_${Math.random()}`,
          title,
          body,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ]);
    },
    [startAlarmSound, triggerNativeNotification],
  );

  // Dismiss current alarm
  const dismissAlarm = () => {
    stopAlarmSound();
    setActiveAlarm(null);
    toast.success("Alarm dismissed");
  };

  // REAL-TIME POLLING: Checks for due medicine doses matching current minute
  const checkDueReminders = useCallback(async () => {
    try {
      const res = await medicineApi.getAll();
      const medsArray = Array.isArray(res.data)
        ? res.data
        : res.data?.medicines || res.data?.data || [];

      const now = new Date();
      const currentHHMM = now.toTimeString().slice(0, 5); // "02:09"
      const dateKey = now.toISOString().slice(0, 10); // "2026-09-24"

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
      console.error("Error checking reminder schedules:", err);
    }
  }, [fireAlarm]);

  // Set up 10-second polling interval for real-time alerts
  useEffect(() => {
    checkDueReminders();
    const interval = setInterval(checkDueReminders, 10000);
    return () => clearInterval(interval);
  }, [checkDueReminders]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        toast.success("Browser notifications enabled!");
        triggerNativeNotification("Medora Alarms Active", {
          body: "Your device will now ring loudly when medications are due.",
        });
        await syncFcmToken();
      } else if (result === "denied") {
        toast.error(
          "Notifications blocked please enable them in browser settings",
        );
      }
    } catch (err) {
      toast.error("Failed to request notification permission");
    }
  };

  const syncFcmToken = async () => {
    setSyncing(true);
    try {
      const simulatedToken = `fcm_${user?._id || "anon"}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      await authApi.saveFcmToken(simulatedToken);
      setSynced(true);
      toast.success("Notification token registered");
    } catch (err) {
      toast.error(err.normalizedMessage || "Failed to sync device token");
    } finally {
      setSyncing(false);
    }
  };

  const handleTestAlarm = () => {
    unlockAudio();
    fireAlarm("Paracetamol", "500 mg", "After Food");
  };

  const statusConfig = {
    granted: {
      label: "Enabled",
      color: "text-brand-600 bg-brand-50 border-brand-200",
      icon: BellRing,
    },
    denied: {
      label: "Blocked",
      color: "text-red-600 bg-red-50 border-red-200",
      icon: Bell,
    },
    default: {
      label: "Not set up",
      color: "text-slate-500 bg-slate-50 border-slate-200",
      icon: Bell,
    },
  };

  const status = statusConfig[permission] || statusConfig.default;
  const StatusIcon = status.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in relative">
      {/* --- LOUD ALARM OVERLAY MODAL --- */}
      {activeAlarm && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
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
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Medicine Alarm System
          </h1>
          <p className="text-slate-500 mt-1">
            Real-time loud audio alarms and modal notifications
          </p>
        </div>
        <button
          onClick={handleTestAlarm}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-base shadow-sm"
        >
          <BellRing className="w-4 h-4" /> Test Loud Alarm
        </button>
      </div>

      {/* Permission status card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${status.color} border flex items-center justify-center shrink-0`}
          >
            <StatusIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">
                Browser Desktop Popups
              </h2>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {permission === "granted"
                ? "Your browser is allowed to display persistent alarm alerts."
                : permission === "denied"
                  ? "Notifications are currently blocked by browser settings."
                  : "Enable permissions so your browser can pop up desktop alerts when doses are due."}
            </p>

            {permission !== "granted" && (
              <button
                onClick={requestPermission}
                className="mt-4 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-base"
              >
                <BellRing className="w-4 h-4" /> Enable desktop alarms
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sound & Device Sync Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sound Toggle */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${soundEnabled ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"} flex items-center justify-center`}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">Alarm Siren</p>
              <p className="text-xs text-slate-400">
                {soundEnabled ? "Loop siren on dose time" : "Muted"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              unlockAudio();
              setSoundEnabled(!soundEnabled);
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${soundEnabled ? "bg-brand-600 justify-end" : "bg-slate-200 justify-start"}`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Token Sync */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">
                Device Token Sync
              </p>
              <p className="text-xs text-slate-400">
                {synced ? "Registered on server" : "Needs registration"}
              </p>
            </div>
          </div>
          <button
            onClick={syncFcmToken}
            disabled={syncing}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-base"
          >
            {syncing ? (
              <Spinner size={16} />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Triggered Log */}
      {recentNotifications.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-brand-600" /> Alarm Trigger
              History
            </h3>
            <span className="text-xs text-slate-400">
              {recentNotifications.length} alarms
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {recentNotifications.map((n) => (
              <div key={n.id} className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  {n.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

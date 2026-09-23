import { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Smartphone, Shield, Info, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/Spinner';

export default function Notifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Notifications are not supported in this browser');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        toast.success('Notifications enabled');
        // Send a test notification
        new Notification('Medora Reminders Active', {
          body: 'You will now receive dose reminders and low stock alerts.',
          icon: '/favicon.svg',
        });
        await syncFcmToken();
      } else if (result === 'denied') {
        toast.error('Notifications blocked — please enable them in your browser settings');
      }
    } catch (err) {
      toast.error('Failed to request notification permission');
    }
  };

  const syncFcmToken = async () => {
    setSyncing(true);
    try {
      // Generate a simulated FCM token (in production this comes from Firebase Messaging)
      const simulatedToken = `fcm_${user?._id || 'anon'}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      await authApi.saveFcmToken(simulatedToken);
      setSynced(true);
      toast.success('Notification token synced to your account');
    } catch (err) {
      toast.error(err.normalizedMessage || 'Failed to sync notification token');
    } finally {
      setSyncing(false);
    }
  };

  const statusConfig = {
    granted: {
      label: 'Enabled',
      color: 'text-brand-600 bg-brand-50 border-brand-200',
      icon: BellRing,
    },
    denied: {
      label: 'Blocked',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: Bell,
    },
    default: {
      label: 'Not set up',
      color: 'text-slate-500 bg-slate-50 border-slate-200',
      icon: Bell,
    },
  };

  const status = statusConfig[permission] || statusConfig.default;
  const StatusIcon = status.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 mt-1">Manage how you receive medication reminders and alerts</p>
      </div>

      {/* Permission status card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${status.color} border flex items-center justify-center shrink-0`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900">Browser notifications</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {permission === 'granted'
                ? 'You will receive dose reminders and low stock alerts on this device.'
                : permission === 'denied'
                ? 'Notifications are blocked. Enable them in your browser settings to receive reminders.'
                : 'Enable notifications to get timely dose reminders and low stock alerts.'}
            </p>

            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="mt-4 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-base"
              >
                <BellRing className="w-4 h-4" /> Enable notifications
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Device token sync */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">Device token sync</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sync your device's notification token so the server can send you push reminders.
            </p>
            <div className="mt-4">
              {synced ? (
                <div className="flex items-center gap-2 text-brand-600">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium">Token synced to your account</span>
                  <button
                    onClick={syncFcmToken}
                    disabled={syncing}
                    className="ml-2 text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-base"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-sync
                  </button>
                </div>
              ) : (
                <button
                  onClick={syncFcmToken}
                  disabled={syncing}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-base disabled:opacity-60"
                >
                  {syncing ? <Spinner size={18} /> : <Smartphone className="w-4 h-4" />} Sync device token
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 text-sm">How notifications work</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                We only send medication-related reminders — no spam.
              </li>
              <li className="flex items-start gap-2">
                <Bell className="w-4 h-4 shrink-0 mt-0.5" />
                You will get a reminder 15 minutes before each scheduled dose.
              </li>
              <li className="flex items-start gap-2">
                <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                Your device token is securely stored and linked to your account.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

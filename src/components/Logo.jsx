import { HeartPulse } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-base' },
    md: { box: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-lg' },
    lg: { box: 'w-14 h-14', icon: 'w-8 h-8', text: 'text-2xl' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-3">
      <div className={`${s.box} rounded-xl bg-brand-600 flex items-center justify-center shadow-md`}>
        <HeartPulse className={`${s.icon} text-white`} />
      </div>
      <div>
        <h1 className={`${s.text} font-bold text-slate-900 leading-none`}>Medora</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">Health Companion</p>
      </div>
    </div>
  );
}

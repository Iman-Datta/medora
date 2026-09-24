export default function Logo({ size = "md", showText = true }) {
  const sizes = {
    sm: { img: "h-8 w-8", text: "text-lg", sub: "text-[10px]" },
    md: { img: "h-11 w-11", text: "text-2xl", sub: "text-xs" },
    lg: { img: "h-16 w-16", text: "text-3xl", sub: "text-xs" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-3">
      {/* Container for the logo emblem */}
      <div
        className={`${s.img} flex-shrink-0 flex items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm border border-slate-100`}
      >
        <img
          src="/Title.png"
          alt="Medora Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text Branding */}
      {showText && (
        <div className="flex flex-col justify-center">
          <h1
            className={`${s.text} font-black tracking-tight text-slate-900 leading-none`}
          >
            Medora
          </h1>
          <p
            className={`${s.sub} font-semibold text-amber-600 tracking-wider uppercase mt-1`}
          >
            Care • Remind • Health
          </p>
        </div>
      )}
    </div>
  );
}

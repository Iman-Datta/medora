import React from "react";
import {
  ArrowRight,
  ScanLine,
  BellRing,
  FileText,
  ShieldCheck,
  Clock3,
  HeartPulse,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Medora
              </h1>
              <p className="text-[10px] text-orange-500 font-semibold tracking-wider">
                CARE. REMIND. BETTER HEALTH.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-orange-500 transition">
              How it works
            </a>

            <a href="#features" className="hover:text-orange-500 transition">
              Features
            </a>

            <a href="#about" className="hover:text-orange-500 transition">
              About
            </a>
          </div>

          <button
            onClick={goToLogin}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
          >
            Sign in
          </button>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="relative min-h-screen pt-20 flex items-center overflow-hidden">

        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-[550px] h-[550px] bg-orange-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* Left */}
          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold mb-7">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Smarter medication management
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-slate-900">
              Never miss a
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                medicine again.
              </span>
            </h1>

            <p className="mt-7 text-lg lg:text-xl leading-relaxed text-slate-600 max-w-xl">
              Medora turns prescriptions into simple, timely medicine
              reminders using AI-powered prescription scanning.
            </p>

            <p className="mt-4 text-sm text-slate-500 max-w-lg">
              Just scan your prescription. Medora helps identify medicines,
              dosage and frequency - so patients know what to take and when.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row gap-4">

              <button
                onClick={goToLogin}
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition flex items-center justify-center gap-3"
              >
                Get started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              <a
                href="#how-it-works"
                className="px-7 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold hover:border-orange-200 hover:bg-orange-50 transition flex items-center justify-center"
              >
                See how it works
              </a>

            </div>

            {/* Trust points */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Prescription OCR
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Smart reminders
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Easy to use
              </div>
            </div>
          </div>


          {/* Right - Prescription → Reminder visual */}
          <div className="relative">

            {/* Main card */}
            <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/70 p-6 max-w-lg mx-auto">

              {/* Top */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Today's medication
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Good morning 👋
                  </h3>
                </div>

                <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center">
                  <BellRing className="w-5 h-5 text-orange-500" />
                </div>
              </div>


              {/* Medicine card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400">
                      NEXT REMINDER
                    </p>

                    <h4 className="text-2xl font-bold mt-2">
                      Paracetamol
                    </h4>

                    <p className="text-sm text-slate-300 mt-1">
                      500 mg · 1 tablet
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold">
                    08:00 AM
                  </div>
                </div>

                <div className="mt-6 h-px bg-white/10" />

                <div className="flex items-center gap-2 mt-4 text-sm text-slate-300">
                  <Clock3 className="w-4 h-4 text-orange-400" />
                  Take after breakfast
                </div>

              </div>


              {/* Small activity cards */}
              <div className="grid grid-cols-2 gap-3 mt-4">

                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                  <p className="text-xs text-orange-500 font-semibold">
                    TODAY
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    3
                  </p>

                  <p className="text-xs text-slate-500">
                    medicines
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold">
                    REMINDERS
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    4
                  </p>

                  <p className="text-xs text-slate-500">
                    scheduled
                  </p>
                </div>

              </div>
            </div>


            {/* Floating OCR card */}
            <div className="absolute -left-8 top-20 hidden sm:flex items-center gap-3 bg-white border border-slate-200 shadow-xl rounded-2xl px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-blue-500" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  AI SCAN
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  Prescription detected
                </p>
              </div>
            </div>


            {/* Floating reminder */}
            <div className="absolute -right-6 bottom-16 hidden sm:flex items-center gap-3 bg-white border border-slate-200 shadow-xl rounded-2xl px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-orange-500" />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  REMINDER
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  Time for your medicine
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#how-it-works"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center text-slate-400"
        >
          <span className="text-xs mb-2">Explore</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </a>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="py-24 lg:py-32 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="max-w-2xl mx-auto text-center">

            <p className="text-sm font-bold tracking-widest text-orange-500 uppercase">
              How Medora works
            </p>

            <h2 className="mt-3 text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              From prescription to reminder.
            </h2>

            <p className="mt-5 text-slate-500 text-lg">
              Three simple steps to make medication management easier.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-8 mt-16">

            {/* Step 1 */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition">

              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <ScanLine className="w-7 h-7 text-orange-500" />
                </div>

                <span className="text-5xl font-bold text-slate-100 group-hover:text-orange-100 transition">
                  01
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-slate-900">
                Scan your prescription
              </h3>

              <p className="mt-3 text-slate-500 leading-relaxed">
                Upload or capture a photo of your prescription and let Medora
                process the information.
              </p>

            </div>


            {/* Step 2 */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition">

              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-500" />
                </div>

                <span className="text-5xl font-bold text-slate-100 group-hover:text-blue-100 transition">
                  02
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-slate-900">
                AI reads the prescription
              </h3>

              <p className="mt-3 text-slate-500 leading-relaxed">
                OCR helps extract medicine names, dosage and frequency from
                the prescription.
              </p>

            </div>


            {/* Step 3 */}
            <div className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition">

              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                  <BellRing className="w-7 h-7 text-green-500" />
                </div>

                <span className="text-5xl font-bold text-slate-100 group-hover:text-green-100 transition">
                  03
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-slate-900">
                Get timely reminders
              </h3>

              <p className="mt-3 text-slate-500 leading-relaxed">
                Medora organizes your medicines into reminders so you can stay
                on schedule throughout the day.
              </p>

            </div>

          </div>
        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section
        id="features"
        className="py-24 lg:py-32 bg-slate-950 text-white relative overflow-hidden"
      >

        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">

          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-orange-400 uppercase">
              Built around patients
            </p>

            <h2 className="mt-3 text-4xl lg:text-5xl font-bold tracking-tight">
              Simple enough for everyone.
            </h2>

            <p className="mt-5 text-slate-400 text-lg">
              Designed with clarity in mind, especially for patients who may
              find complex health applications difficult to navigate.
            </p>
          </div>


          <div className="grid md:grid-cols-3 gap-6 mt-14">

            <FeatureCard
              icon={<ScanLine />}
              title="Prescription OCR"
              text="Convert prescription images into structured medicine information."
            />

            <FeatureCard
              icon={<BellRing />}
              title="Timely reminders"
              text="Keep track of when each medicine needs to be taken."
            />

            <FeatureCard
              icon={<ShieldCheck />}
              title="Clear & organized"
              text="Keep medication information accessible in one simple place."
            />

          </div>


          {/* Highlight */}
          <div className="mt-16 p-8 lg:p-12 rounded-[2rem] bg-gradient-to-r from-orange-500 to-orange-600 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

            <div className="max-w-2xl">
              <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider">
                The idea behind Medora
              </p>

              <h3 className="mt-3 text-3xl lg:text-4xl font-bold">
                Technology that remembers when you might forget.
              </h3>

              <p className="mt-4 text-orange-50 leading-relaxed">
                Medora is designed to reduce the everyday difficulty of
                remembering medication schedules and make prescription
                information easier to follow.
              </p>
            </div>

            <button
              onClick={goToLogin}
              className="shrink-0 px-6 py-3.5 rounded-xl bg-white text-orange-600 font-bold hover:bg-orange-50 transition flex items-center gap-2"
            >
              Try Medora
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>

        </div>
      </section>


      {/* ================= ABOUT / FOUNDERS ================= */}
      <section
        id="about"
        className="py-24 lg:py-32 bg-[#f8fafc]"
      >

        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          <div className="text-center max-w-2xl mx-auto">

            <p className="text-sm font-bold tracking-widest text-orange-500 uppercase">
              Meet the team
            </p>

            <h2 className="mt-3 text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Built with care.
            </h2>

            <p className="mt-5 text-slate-500 text-lg">
              Medora is a project built around one simple idea making
              medication management easier and more accessible.
            </p>

          </div>


          {/* Founders */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-14">

            <FounderCard
              name="Sambiti Chattopadhyay"
              role="Co-Founder"
              number="01"
            />

            <FounderCard
              name="Iman Datta"
              role="Co-Founder"
              number="02"
            />

            <FounderCard
              name="Sreetama Santra"
              role="Co-Founder"
              number="03"
            />

            <FounderCard
              name="Barnali Gupta"
              role="Co-Founder"
              number="04"
            />

          </div>

        </div>
      </section>
 

     

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-slate-400">

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>

              <div>
                <p className="font-bold text-white">
                  Medora
                </p>
                <p className="text-xs">
                  Care. Remind. Better Health.
                </p>
              </div>

            </div>

            <p className="text-sm">
            © 2026 Medora. All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
};


/* ================= FEATURE CARD ================= */

const FeatureCard = ({ icon, title, text }) => {
  return (
    <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.06] transition">

      <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
        {React.cloneElement(icon, {
          className: "w-6 h-6",
        })}
      </div>

      <h3 className="mt-6 text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 text-slate-400 leading-relaxed">
        {text}
      </p>

    </div>
  );
};


/* ================= FOUNDER CARD ================= */

const FounderCard = ({ name, role, number }) => {
  return (
    <div className="group relative p-6 lg:p-7 rounded-3xl bg-white border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/40 transition overflow-hidden">

      <span className="absolute -right-2 -top-5 text-7xl font-bold text-slate-50 group-hover:text-orange-50 transition">
        {number}
      </span>

      <div className="relative z-10">

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-100">
          {name.charAt(0)}
        </div>

        <h3 className="mt-5 font-bold text-slate-900 leading-snug">
          {name}
        </h3>

        <p className="mt-1 text-sm text-orange-500 font-medium">
          {role}
        </p>

      </div>

    </div>
  );
};


export default LandingPage;
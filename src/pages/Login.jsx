import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";
import Spinner from "@/components/Spinner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const token = res.data.accessToken || res.data.token;
      const user = res.data.user || res.data;
      login(token, user);
      toast.success(`Welcome back, ${user?.name?.split(" ")[0] || "there"}!`);
      navigate("/dashboard");
      
    } catch (err) {
      toast.error(
        err.normalizedMessage || "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-orange-500 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Top Brand Banner */}
          <div className="flex items-center gap-4  backdrop-blur-md p-3.5 pr-6 rounded-2xl w-fit border border-white/10">
            <div className="w-12 h-12 rounded-xl  p-1 flex items-center justify-center shadow-md">
              <img
                src="/Title.png"
                alt="Medora"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-none">
                Medora
              </h1>
              <p className="text-amber-400 text-xs font-medium mt-1">
                Care. Remind. Better Health.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight">
              Never miss a dose again.
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Manage medications, scan prescriptions with AI, and get timely
              reminders-all in one beautiful dashboard.
            </p>
            <div className="space-y-3 pt-4">
              {[
                "Smart medication reminders",
                "AI-powered prescription scanning",
                "Low stock alerts & tracking",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-slate-200 text-sm font-medium">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Medora.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Welcome back
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              Sign in to your Medora account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-amber-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Spinner size={20} />
                ) : (
                  <>
                    Sign in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-amber-600 font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bug,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  FolderKanban,
  Zap,
  Users2,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import { loginUser, loginWithGoogle } from "../../api/authApi";
import ThemeToggle from "../../components/ui/ThemeToggle";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Existing email/password login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      login(
        {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        },
        response.token
      );

      toast.success(`Welcome back, ${response.name || "User"}!`);
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.message ||
        "Invalid email address or password. Please verify your credentials."
      );
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Google login through the existing Spring Boot API
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential || googleLoading) {
      toast.error("Google did not return a valid credential.");
      return;
    }

    setGoogleLoading(true);
    setError("");

    try {
      const response = await loginWithGoogle(
        credentialResponse.credential
      );

      if (!response?.token || !response?.id) {
        throw new Error(
          "The server did not return the expected user and token."
        );
      }

      login(
        {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
        },
        response.token
      );

      toast.success(`Welcome back, ${response.name || "User"}!`);
      navigate("/");
    } catch (err) {
      console.error("Google Login Error:", err);

      const message =
        err.response?.data?.message ||
        "Google sign-in failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 text-slate-800 transition-colors duration-200 dark:bg-[#070B12] dark:text-slate-100 sm:p-6 lg:p-10">
      {/* Single theme toggle on the login page */}
      <div className="absolute right-5 top-5 z-20 sm:right-7 sm:top-7">
        <ThemeToggle />
      </div>

      <div className="grid min-h-[620px] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-500/5 transition-colors duration-200 dark:border-slate-800 dark:bg-[#0B0F17] dark:shadow-black/70 md:grid-cols-12">
        {/* Login form */}
        <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14 md:col-span-7">
          <div>
            {/* Brand */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Bug size={23} />
              </div>

              <div>
                <span className="block text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  BugTracker
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Agile Issue Management
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Welcome back
              </h1>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Sign in to manage bugs, monitor projects, and track your
                team's progress.
              </p>
            </div>

            {/* Google sign-in */}
            <div className="mb-6">
              <div className="flex min-h-[44px] items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast.error("Google sign-in was unsuccessful.");
                  }}
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  width="300"
                  useOneTap={false}
                />
              </div>

              {googleLoading && (
                <p className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <Loader2 size={14} className="animate-spin" />
                  Signing in with Google...
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="shrink-0 bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-[#0B0F17] dark:text-slate-500">
                Or sign in with email
              </span>
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email/password form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to workspace"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-[11px] text-slate-400 dark:border-slate-800 sm:flex-row">
            <span>© 2026 BugTracker</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-blue-500" />
              Secure authentication
            </span>
          </div>
        </div>

        {/* Feature showcase */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 p-8 text-white md:col-span-5 md:flex lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
              <Zap size={14} className="text-amber-300" />
              Built for software teams
            </div>

            <h2 className="mt-6 text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
              Find it. Track it. Fix it.
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-blue-100">
              Keep your projects organized, collaborate with your team, and
              follow every bug from discovery to resolution.
            </p>
          </div>

          <div className="relative z-10 my-8 space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <FolderKanban size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Kanban boards</h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-100">
                  Track bugs as they move through your workflow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <CheckCircle2 size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Clear bug tracking</h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-100">
                  Manage priorities, assignments, and resolutions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Users2 size={17} />
              </div>
              <div>
                <h3 className="text-sm font-bold">Team collaboration</h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-100">
                  Keep developers and project teams aligned.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-blue-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            One workspace for your team
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

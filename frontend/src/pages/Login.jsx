import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const Login = () => {
  const { sendOtp, register, loginUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  // "login" | "signup"
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  // ----- Login tab state -----
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // ----- Signup tab state -----
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const switchMode = (nextMode) => {
    setMode(nextMode);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!name.trim() || !username.trim() || !email.trim()) {
      toast.error("Please fill in your name, username and email");
      return;
    }

    setOtpLoading(true);
    try {
      await sendOtp(email.trim(), "email");
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEditDetails = () => {
    setOtpSent(false);
    setOtp("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (otp.trim().length < 4) {
      toast.error("Enter the OTP sent to your email");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setRegisterLoading(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password: signupPassword,
        otp: otp.trim(),
      });

      toast.success("Account created! Please log in.");

      // Hand off straight into the login tab, pre-filled, for a smooth finish.
      setIdentifier(username.trim() || email.trim());
      setMode("login");
      setOtpSent(false);
      setOtp("");
      setSignupPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !loginPassword) {
      toast.error("Enter your username/email and password");
      return;
    }

    setLoginLoading(true);
    try {
      await loginUser(identifier.trim(), loginPassword);
      toast.success("Welcome to Vaishnavi Milk Dairy!");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      toast.success("Welcome to Vaishnavi Milk Dairy!");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-pasture-50 px-4 py-12 dark:bg-noir-950">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={42} />
          <h1 className="mt-4 text-xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-ink-700/70 dark:text-cream-100/60">Fresh dairy is just a few taps away.</p>
        </div>

        {/* Login / Signup tab switcher */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-full bg-cream-200 dark:bg-noir-800 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === "login" ? "bg-white shadow-card text-pasture-700 dark:bg-noir-900 dark:text-gold-300" : "text-ink-700/60 dark:text-cream-100/50"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === "signup" ? "bg-white shadow-card text-pasture-700 dark:bg-noir-900 dark:text-gold-300" : "text-ink-700/60 dark:text-cream-100/50"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* ---------------- LOGIN TAB ---------------- */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-text">Username or email</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30" />
                <input
                  className="input-field pl-10"
                  placeholder="yourname or you@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30" />
                <input
                  className="input-field pl-10 pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30 hover:text-ink-700 dark:hover:text-cream-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loginLoading} className="btn-primary w-full">
              {loginLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
        )}

        {/* ---------------- SIGNUP TAB ---------------- */}
        {mode === "signup" && (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="label-text">Full name</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Asha Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="label-text">Username</label>
                  <input
                    className="input-field"
                    placeholder="e.g. asha_verma"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="label-text">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30" />
                    <input
                      className="input-field pl-10"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button type="submit" disabled={otpLoading} className="btn-primary w-full">
                  {otpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <button
                  type="button"
                  onClick={handleEditDetails}
                  className="mb-1 flex items-center gap-1 text-xs font-semibold text-ink-700/60 dark:text-cream-100/50 hover:text-pasture-600 dark:hover:text-gold-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Edit details
                </button>

                <div>
                  <label className="label-text">Enter the OTP sent to {email}</label>
                  <input
                    className="input-field text-center text-lg tracking-[0.5em]"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div>
                  <label className="label-text">Create a password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30" />
                    <input
                      className="input-field pl-10 pr-10"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-700/40 dark:text-cream-100/30 hover:text-ink-700 dark:hover:text-cream-100"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={registerLoading} className="btn-primary w-full">
                  {registerLoading ? "Creating account..." : "Create account"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full text-center text-xs font-semibold text-pasture-600 hover:underline dark:text-gold-300"
                >
                  {otpLoading ? "Resending..." : "Resend OTP"}
                </button>
              </form>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-700/50 dark:text-cream-100/40">
              <ShieldCheck className="h-3.5 w-3.5" /> We verify your email to keep your account secure.
            </p>
          </>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-cream-200 dark:bg-noir-800" />
          <span className="text-xs font-semibold uppercase text-ink-700/40 dark:text-cream-100/30">or</span>
          <div className="h-px flex-1 bg-cream-200 dark:bg-noir-800" />
        </div>

        <div className="flex justify-center">
          {googleLoading ? (
            <p className="text-sm text-ink-700/60 dark:text-cream-100/50">Signing you in...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed")}
              shape="pill"
              text="continue_with"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

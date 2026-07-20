import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useToast } from "../components/common/ToastProvider";
import { loginUser } from "../services/authService";
import {
  getErrorMessage,
  storeAuthData,
  validateRequiredFields,
} from "../utils/helpers";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateRequiredFields([
      { label: "Email", value: form.email },
      { label: "Password", value: form.password },
    ]);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(form);
      storeAuthData(data);
      showSuccess("Login successful.");
      navigate("/dashboard");
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-6 px-4">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] max-w-4xl w-full mx-auto">
        
        {/* Left Side: About Website Card (Only Displays Info About Website) */}
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0d4f40_0%,#0f6e58_46%,#bf6c2f_100%)] p-8 text-white flex flex-col justify-between shadow-2xl">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Direct-to-Farm Marketplace
            </span>
            <h2 className="text-4xl font-bold font-serif mt-6 leading-tight">
              Sourcing Fresh, Organic Produce From Local Regional Farms
            </h2>
            <p className="text-sm mt-4 text-emerald-50/80 leading-relaxed">
              NatureCart connects conscious consumers directly with certified regional producers. We bring transparency to community trade, supporting local farming operations with simple coordination, clear seller ownership, and secure scheduled harvests.
            </p>
          </div>
          <div className="mt-8 border-t border-white/20 pt-6">
            <p className="text-xs uppercase tracking-wider text-amber-200/90 font-semibold">Our Values</p>
            <div className="flex gap-4 mt-3 text-xs text-emerald-50/90">
              <div>🌽 Direct Trade</div>
              <div>🌿 Verified Organic</div>
              <div>📍 Local Pickup</div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Shell */}
        <div className="auth-shell w-full shadow-2xl border border-slate-100 flex flex-col justify-center p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-700 font-semibold">Welcome Back</p>
          <h1 className="mb-4 mt-3 text-3xl font-bold text-slate-900 font-serif">Sign In</h1>
          <p className="mb-6 text-sm text-slate-500">
            Access your secure role-based workspace and transaction dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />

            <Input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />

            <Button className="w-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] mt-2" type="submit">
              {loading ? "Logging In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm border-t border-slate-150 pt-4">
            <Link to="/forgot-password" className="font-semibold text-[#0f766e] hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="font-semibold text-slate-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

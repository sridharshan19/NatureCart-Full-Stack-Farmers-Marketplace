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
    <div className="auth-shell max-w-md">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Welcome back</p>
      <h2 className="mb-4 mt-3 text-3xl font-bold text-slate-900">Login</h2>
      <p className="mb-6 text-sm text-slate-600">
        Enter your account details to access your NatureCart workspace.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
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

        <Button className="w-full" type="submit">
          {loading ? "Logging In..." : "Login"}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="font-semibold text-[#0f766e]">
          Forgot password?
        </Link>
        <Link to="/reset-password" className="font-semibold text-slate-600">
          Reset password
        </Link>
      </div>
    </div>
  );
}

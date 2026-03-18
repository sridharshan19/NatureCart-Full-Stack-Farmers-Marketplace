import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useToast } from "../components/common/ToastProvider";
import { resetPassword } from "../services/authService";
import { getErrorMessage, validateRequiredFields } from "../utils/helpers";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "consumer",
    token: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateRequiredFields([
      { label: "Role", value: form.role },
      { label: "Reset token", value: form.token },
      { label: "New password", value: form.newPassword },
    ]);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(form);
      showSuccess(data.msg || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/50 bg-white/95 p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Secure access</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Reset Password</h1>
      <p className="mt-3 text-sm text-slate-600">
        Paste the reset token from the forgot-password step and choose a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <select
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          className="w-full rounded-2xl border border-[#d7d2c8] bg-[#fffaf4] p-3 text-slate-800 shadow-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
        >
          <option value="consumer">Consumer</option>
          <option value="farmer">Farmer</option>
        </select>

        <Input
          placeholder="Reset token"
          required
          value={form.token}
          onChange={(event) => setForm((current) => ({ ...current, token: event.target.value }))}
        />

        <Input
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          required
          value={form.newPassword}
          onChange={(event) =>
            setForm((current) => ({ ...current, newPassword: event.target.value }))
          }
        />

        <Button className="w-full" type="submit">
          {loading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need a token first?{" "}
        <Link to="/forgot-password" className="font-semibold text-[#0f766e]">
          Open forgot password
        </Link>
      </p>
    </div>
  );
}

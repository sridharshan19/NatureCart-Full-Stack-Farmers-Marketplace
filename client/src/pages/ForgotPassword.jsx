import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useToast } from "../components/common/ToastProvider";
import { forgotPassword } from "../services/authService";
import { getErrorMessage, validateRequiredFields } from "../utils/helpers";

export default function ForgotPassword() {
  const [form, setForm] = useState({
    role: "consumer",
    email: "",
  });
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResetToken("");

    const validationMessage = validateRequiredFields([
      { label: "Role", value: form.role },
      { label: "Email", value: form.email },
    ]);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(form);
      showSuccess(data.msg || "Password reset token generated successfully.");
      setResetToken(data.resetToken || "");
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-white/50 bg-white/95 p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Account recovery</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Forgot Password</h1>
      <p className="mt-3 text-sm text-slate-600">
        Select your role and enter your account email to generate a reset token.
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
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />

        <Button className="w-full" type="submit">
          {loading ? "Generating Token..." : "Generate Reset Token"}
        </Button>
      </form>
      {resetToken ? (
        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-4 text-sm text-teal-800">
          <p className="font-semibold">Reset token</p>
          <p className="mt-2 break-all">{resetToken}</p>
          <Link
            to="/reset-password"
            className="mt-4 inline-block rounded-full bg-[#0f766e] px-4 py-2 font-semibold text-white"
          >
            Continue to Reset Password
          </Link>
        </div>
      ) : null}
    </div>
  );
}

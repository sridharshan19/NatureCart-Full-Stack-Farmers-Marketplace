import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useToast } from "../components/common/ToastProvider";
import { registerUser } from "../services/authService";
import {
  getErrorMessage,
  storeAuthData,
  validateRequiredFields,
} from "../utils/helpers";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "consumer",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    farmName: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateRequiredFields(
      form.role === "farmer"
        ? [
            { label: "Name", value: form.name },
            { label: "Email", value: form.email },
            { label: "Password", value: form.password },
            { label: "Phone", value: form.phone },
            { label: "Farm name", value: form.farmName },
            { label: "Location", value: form.location },
          ]
        : [
            { label: "Name", value: form.name },
            { label: "Email", value: form.email },
            { label: "Password", value: form.password },
            { label: "Phone", value: form.phone },
            { label: "Address", value: form.address },
          ]
    );

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      const payload =
        form.role === "farmer"
          ? {
              role: form.role,
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              farmName: form.farmName,
              location: form.location,
            }
          : {
              role: form.role,
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              address: form.address,
            };

      const data = await registerUser(payload);
      storeAuthData(data);
      showSuccess("Account created successfully.");
      navigate("/dashboard");
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-6 px-4">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.20fr] max-w-5xl w-full mx-auto">
        
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

        {/* Right Side: Register Form Shell */}
        <div className="auth-shell w-full shadow-2xl border border-slate-100 flex flex-col justify-center p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-700 font-semibold">Join NatureCart</p>
          <h1 className="mb-4 mt-3 text-3xl font-bold text-slate-900 font-serif">Create Account</h1>
          <p className="mb-6 text-sm text-slate-550">
            Fill in your details to create a consumer account and start ordering fresh produce.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="Full Name"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange("name")}
            />
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange("email")}
            />
            <Input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange("password")}
            />
            <Input
              placeholder="Phone number"
              autoComplete="tel"
              required
              value={form.phone}
              onChange={handleChange("phone")}
            />
            <Input
              placeholder="Pickup Coordinates / Delivery Address"
              autoComplete="street-address"
              required
              value={form.address}
              onChange={handleChange("address")}
            />

            <Button className="w-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] mt-4" type="submit">
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm border-t border-slate-150 pt-4">
            <span className="text-slate-500">Already have an account?</span>
            <Link to="/login" className="font-semibold text-[#0f766e] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

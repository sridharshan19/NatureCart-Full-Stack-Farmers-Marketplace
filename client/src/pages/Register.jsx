import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="auth-shell max-w-xl">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Join NatureCart</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Create Account</h1>
      <p className="mt-3 text-sm text-slate-600">
        Register as a consumer or farmer using the same role contract as the backend.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <select
          value={form.role}
          onChange={handleChange("role")}
          className="select-field"
        >
          <option value="consumer">Consumer</option>
          <option value="farmer">Farmer</option>
        </select>

        <Input
          placeholder="Name"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange("name")}
        />
        <Input
          type="email"
          placeholder="Email"
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
          placeholder="Phone"
          autoComplete="tel"
          required
          value={form.phone}
          onChange={handleChange("phone")}
        />

        {form.role === "consumer" ? (
          <Input
            placeholder="Address"
            autoComplete="street-address"
            required
            value={form.address}
            onChange={handleChange("address")}
          />
        ) : (
          <>
            <Input
              placeholder="Farm Name"
              required
              value={form.farmName}
              onChange={handleChange("farmName")}
            />
            <Input
              placeholder="Location"
              required
              value={form.location}
              onChange={handleChange("location")}
            />
          </>
        )}

        <Button className="w-full" type="submit">
          {loading ? "Creating Account..." : "Register"}
        </Button>
      </form>
    </div>
  );
}

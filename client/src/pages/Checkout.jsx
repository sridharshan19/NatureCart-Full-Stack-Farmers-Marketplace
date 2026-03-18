import { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useToast } from "../components/common/ToastProvider";
import { useCart } from "../hooks/useCart";
import { placeOrder } from "../services/orderService";
import {
  formatCurrency,
  getErrorMessage,
  getStoredUser,
  validateRequiredFields,
} from "../utils/helpers";

export default function Checkout() {
  const user = getStoredUser();
  const { cart, clearAll } = useCart();
  const [form, setForm] = useState({
    pickupDate: "",
    pickupTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { showError, showSuccess } = useToast();

  if (!user || user.role !== "consumer") {
    return (
      <div className="rounded-[2rem] bg-white/95 p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-2 text-slate-600">Login as a consumer to place an order.</p>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!cart?.items?.length) {
      showError("Add at least one product to your cart before checkout.");
      return;
    }

    const validationMessage = validateRequiredFields([
      { label: "Pickup date", value: form.pickupDate },
      { label: "Pickup time", value: form.pickupTime },
    ]);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        products: cart.items.map((item) => ({
          productId: item.productId._id,
          productName: item.productId.productName,
          quantity: item.quantity,
        })),
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
      };

      await placeOrder(payload);
      await clearAll();
      showSuccess("Order placed successfully. Your cart has been cleared.");
      setForm({ pickupDate: "", pickupTime: "" });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white/95 p-8 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Pickup checkout</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Checkout</h1>
      <p className="mt-2 text-sm text-slate-600">
        Cart total: {formatCurrency(cart?.totalAmount || 0)}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          type="date"
          required
          value={form.pickupDate}
          onChange={(event) =>
            setForm((current) => ({ ...current, pickupDate: event.target.value }))
          }
        />
        <Input
          placeholder="Pickup time e.g. 10:00 AM"
          required
          value={form.pickupTime}
          onChange={(event) =>
            setForm((current) => ({ ...current, pickupTime: event.target.value }))
          }
        />

        <Button className="w-full" type="submit">
          {submitting ? "Placing Order..." : "Place Order"}
        </Button>
      </form>
    </div>
  );
}

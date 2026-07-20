import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const isTimeOutsideRange = useMemo(() => {
    if (!form.pickupTime) return false;
    const [hours] = form.pickupTime.split(":").map(Number);
    return hours < 8 || hours > 19;
  }, [form.pickupTime]);

  if (!user || user.role !== "consumer") {
    return (
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl max-w-xl mx-auto text-center my-8">
        <span className="text-4xl">🔐</span>
        <h1 className="text-3xl font-bold text-slate-900 mt-4">Consumer Checkout Only</h1>
        <p className="mt-2 text-slate-600">Please login as a consumer to view checkout options.</p>
        <Link to="/login" className="mt-6 inline-block rounded-full bg-[#1f7a5c] px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-950/10 hover:-translate-y-0.5">
          Go to Login
        </Link>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl max-w-md mx-auto text-center my-8">
        <span className="text-4xl">🛒</span>
        <h1 className="text-3xl font-bold text-slate-900 mt-4">Your Basket is Empty</h1>
        <p className="mt-2 text-slate-600">You must add products to your cart before proceeding to checkout.</p>
        <Link to="/products" className="mt-6 inline-block rounded-full bg-[#1f7a5c] px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-950/10 hover:-translate-y-0.5">
          Browse Products
        </Link>
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0d4f40_0%,#0f6e58_46%,#bf6c2f_100%)] p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200 font-semibold">Checkout Flow</p>
        <h1 className="mt-3 text-3xl font-bold">Secure Your Pickup</h1>
        <p className="mt-3 max-w-2xl text-sm text-emerald-50/90 leading-6">
          Coordinate order details with local farmers. Check your items and confirm your pickup window parameters.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Order Summary Column */}
        <div className="space-y-4 rounded-[1.75rem] border border-white/60 bg-white/95 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100">Review Items</h2>
          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-2">
            {cart.items.map((item) => (
              <div key={item.productId?._id || item._id} className="py-3 flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-slate-800">{item.productId?.productName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.quantity} x {formatCurrency(item.productId?.price || 0)}
                  </p>
                </div>
                  <p className="font-semibold text-slate-950 self-center">
                  {formatCurrency((item.productId?.price || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span className="font-semibold text-slate-850">{cart.totalItems} units</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-800 pt-1">
              <span>Total Amount</span>
              <span className="text-emerald-800 font-extrabold text-lg">{formatCurrency(cart.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Form Details Column */}
        <div className="space-y-4 rounded-[1.75rem] border border-white/60 bg-white/95 p-6 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-slate-900 pb-2 border-b border-slate-100 font-serif">Coordination Details</h2>
          <p className="text-xs text-slate-500 leading-normal">
            Select a date and approximate time window for coordination with the local farmer.
          </p>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-1.5">
            <p className="text-xs uppercase tracking-wider text-emerald-800 font-bold">💳 Payment Method</p>
            <p className="text-xs font-semibold text-slate-800">Cash on Delivery / Pay on Pickup (Offline)</p>
            <p className="text-[11px] text-slate-650 leading-normal">No online payment required. Please pay the total amount of <strong>{formatCurrency(cart?.totalAmount || 0)}</strong> directly to the farmer during pickup handoff.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Pickup Date</label>
              <Input
                type="date"
                required
                min={todayStr}
                value={form.pickupDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pickupDate: event.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Pickup Time</label>
              <Input
                type="time"
                required
                value={form.pickupTime}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pickupTime: event.target.value }))
                }
              />
            </div>

            {isTimeOutsideRange && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 leading-normal">
                ⚠️ Selected time is outside standard business hours (8:00 AM - 7:00 PM). Please ensure you have coordinated this pickup timing with the farmer.
              </div>
            )}

            <Button className="w-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] mt-2" type="submit">
              {submitting ? "Placing Order..." : "Confirm & Place Order"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

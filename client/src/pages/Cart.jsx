import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { useCart } from "../hooks/useCart";
import { formatCurrency, getErrorMessage, getStoredUser } from "../utils/helpers";

export default function Cart() {
  const { cart, loading, error, refreshCart, removeItem, clearAll } = useCart();
  const user = getStoredUser();
  const { showError, showInfo, showSuccess } = useToast();

  const handleRefresh = async () => {
    try {
      await refreshCart();
      showInfo("Cart refreshed.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
      showSuccess("Product removed from your cart.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleClear = async () => {
    try {
      await clearAll();
      showSuccess("Cart cleared successfully.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  if (!user || user.role !== "consumer") {
    return (
      <div className="rounded-[2rem] bg-white/95 p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Cart</h1>
        <p className="mt-2 text-slate-600">Login as a consumer to use the cart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#1f2937_0%,#0f766e_55%,#b45309_100%)] p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Consumer cart</p>
        <h1 className="mt-3 text-3xl font-bold">Cart</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-100/85">
          Review your selected produce, keep quantities in view, and move smoothly
          into checkout.
        </p>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Selected Items</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            className="bg-white !text-slate-800 hover:!bg-slate-100"
          >
            Refresh
          </Button>
          <Button onClick={handleClear}>Clear Cart</Button>
        </div>
      </div>

      {loading ? <Loader label="Loading cart..." /> : null}
      {error ? <p className="rounded-2xl bg-rose-50 p-3 text-rose-700">{error}</p> : null}

      {!loading && cart?.items?.length ? (
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.productId?._id || item._id}
              className="flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-lg"
            >
              <div>
                <h2 className="font-semibold text-slate-900">{item.productId?.productName}</h2>
                <p className="text-sm text-slate-500">
                  Qty: {item.quantity} | {formatCurrency(item.productId?.price || 0)}
                </p>
              </div>
              <Button onClick={() => handleRemove(item.productId?._id)}>Remove</Button>
            </div>
          ))}

          <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0f766e_0%,#115e59_55%,#b45309_100%)] p-5 text-white shadow-xl">
            <p>Total Items: {cart.totalItems}</p>
            <p>Total Amount: {formatCurrency(cart.totalAmount)}</p>
            <Link
              to="/checkout"
              className="mt-3 inline-block rounded-full bg-white px-4 py-2 font-semibold text-slate-900"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && !cart?.items?.length ? (
        <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
          <p>Your cart is empty. Add a few fresh products to get started.</p>
        </div>
      ) : null}
    </div>
  );
}

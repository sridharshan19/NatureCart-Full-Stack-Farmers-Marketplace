import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="rounded-2xl bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-semibold">Quick Links</h2>
      <div className="flex flex-col gap-2 text-sm text-green-700">
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/checkout">Checkout</Link>
        <Link to="/orders">Orders</Link>
      </div>
    </aside>
  );
}

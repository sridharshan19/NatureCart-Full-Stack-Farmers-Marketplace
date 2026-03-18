import ProductCard from "./ProductCard";

export default function ProductList({ products, onAdd, actionLabel }) {
  if (!products.length) {
    return (
      <div className="rounded-xl bg-white p-6 text-center shadow">
        <p className="text-gray-600">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAdd={onAdd}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
}

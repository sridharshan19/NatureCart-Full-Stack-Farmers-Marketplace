import ProductCard from "./ProductCard";

export default function ProductList({ products, onAdd, actionLabel }) {
  if (!products.length) {
    return (
      <div className="section-card rounded-[1.6rem] p-8 text-center">
        <p className="text-slate-600">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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

import { useEffect, useMemo, useState } from "react";
import ProductList from "../components/product/ProductList";
import ProductFilter from "../components/product/ProductFilter";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { useCart } from "../hooks/useCart";
import { getProducts } from "../services/productService";
import { getErrorMessage, getStoredUser } from "../utils/helpers";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { showError, showInfo, showSuccess } = useToast();
  const user = getStoredUser();
  const canOrderProducts = user?.role === "consumer";

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.productName} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleAddToCart = async (product) => {
    if (!user || user.role !== "consumer") {
      showInfo("Login as a consumer to add products to your cart.");
      return;
    }

    try {
      await addItem(product._id, 1);
      showSuccess(`${product.productName} was added to your cart.`);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <section className="soft-hero p-8 text-slate-900">
        <div className="absolute -right-8 top-4 h-32 w-32 rounded-full bg-pink-200/20 blur-3xl" />
        <div className="absolute left-10 top-16 h-24 w-24 rounded-full bg-amber-100/20 blur-3xl" />
        <p className="text-sm uppercase tracking-[0.35em] text-amber-700">
          Product market
        </p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Marketplace Catalog</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-700">
              Browse live produce listings from your backend catalog with a cleaner,
              more professional storefront presentation.
            </p>
          </div>
          <ProductFilter value={search} onChange={setSearch} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="section-card color-pop rounded-[1.5rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live products</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{products.length}</p>
        </div>
        <div className="section-card color-pop rounded-[1.5rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Filtered results</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{filteredProducts.length}</p>
        </div>
        <div className="section-card color-pop rounded-[1.5rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ordering access</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {canOrderProducts ? "Consumer ordering enabled" : "Browse-only mode"}
          </p>
        </div>
      </section>

      {loading ? <Loader label="Loading products..." /> : null}

      {!loading ? (
        <ProductList
          products={filteredProducts}
          onAdd={canOrderProducts ? handleAddToCart : null}
          actionLabel="Add to Cart"
        />
      ) : null}

      {!loading && !filteredProducts.length ? (
        <div className="section-card rounded-[1.75rem] p-6">
          <p className="text-slate-600">
            No products matched your search. Try a different name or category.
          </p>
        </div>
      ) : null}
    </div>
  );
}

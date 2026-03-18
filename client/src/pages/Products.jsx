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
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#1f2937_0%,#0f766e_55%,#b45309_100%)] p-8 text-white shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200">
          Product market
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Available Products</h1>
            <p className="text-sm text-slate-100/85">
              Browse fresh produce from the backend product API.
            </p>
          </div>
          <ProductFilter value={search} onChange={setSearch} />
        </div>
      </section>

      <div>
        <h2 className="mb-1 text-2xl font-bold text-slate-900">Harvest Selection</h2>
        <p className="text-sm text-slate-600">
          Explore every live product in the marketplace with the same color system
          used across the full app experience.
        </p>
      </div>

      {loading ? <Loader label="Loading products..." /> : null}

      {!loading ? (
        <ProductList
          products={filteredProducts}
          onAdd={canOrderProducts ? handleAddToCart : null}
          actionLabel="Add to Cart"
        />
      ) : null}

      {!loading && !filteredProducts.length ? (
        <div className="rounded-[1.75rem] bg-white p-6 shadow-lg">
          <p className="text-slate-600">
            No products matched your search. Try a different name or category.
          </p>
        </div>
      ) : null}
    </div>
  );
}

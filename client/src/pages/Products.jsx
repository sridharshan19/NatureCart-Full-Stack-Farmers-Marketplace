import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductList from "../components/product/ProductList";
import ProductFilter from "../components/product/ProductFilter";
import ProductModal from "../components/product/ProductModal";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { useCart } from "../hooks/useCart";
import { getProducts } from "../services/productService";
import { getErrorMessage, getStoredUser } from "../utils/helpers";

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  const { addItem } = useCart();
  const { showError, showInfo } = useToast();
  const user = getStoredUser();
  const canOrderProducts = user?.role === "consumer";
  const [redirectingProduct, setRedirectingProduct] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== "All") params.category = category;
      if (sort) params.sort = sort;
      if (inStockOnly) params.inStock = "true";

      const data = await getProducts(params);
      setProducts(data);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, inStockOnly, showError]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!redirectingProduct) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [redirectingProduct, navigate]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter((p) => {
        const farmName =
          typeof p.farmerId === "object"
            ? p.farmerId?.farmName || p.farmerId?.name
            : "";
        return (
          p.productName?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          farmName?.toLowerCase().includes(query)
        );
      });
    }

    if (category !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (inStockOnly) {
      result = result.filter((p) => Number(p.quantity || 0) > 0);
    }

    if (sort === "price_asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price_desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "name_asc") {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return result;
  }, [products, search, category, inStockOnly, sort]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setInStockOnly(false);
  };

  const handleAddToCart = async (product, quantity = 1) => {
    if (!user || user.role !== "consumer") {
      showInfo("Login as a consumer to add products to your cart.");
      return;
    }

    try {
      await addItem(product._id, quantity);
      setCountdown(5);
      setRedirectingProduct(product);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <section className="soft-hero p-8 text-slate-900">
        <div className="absolute -right-8 top-4 h-32 w-32 rounded-full bg-pink-200/20 blur-3xl" />
        <div className="absolute left-10 top-16 h-24 w-24 rounded-full bg-amber-100/20 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">
          Direct Sourced Marketplace
        </p>
        <div className="mt-3">
          <h1 className="mb-2 text-4xl font-bold font-serif text-slate-950">
            Marketplace Catalog
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-700">
            Discover organic, locally harvested produce listed directly by verified regional farmers.
          </p>
        </div>
      </section>

      {/* Advanced Filter Component */}
      <ProductFilter
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onReset={handleResetFilters}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="section-card color-pop rounded-[1.5rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live products</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{products.length}</p>
        </div>
        <div className="section-card color-pop rounded-[1.5rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Filtered results</p>
          <p className="mt-2 text-3xl font-bold text-teal-700">{filteredProducts.length}</p>
        </div>
        <div className="section-card color-pop rounded-[1.5rem] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ordering access</p>
          <p className="mt-2 text-base font-semibold text-slate-950">
            {canOrderProducts ? "Consumer ordering enabled" : "Browse-only mode"}
          </p>
        </div>
      </section>

      {loading ? <Loader label="Loading fresh produce..." /> : null}

      {!loading ? (
        <ProductList
          products={filteredProducts}
          onAdd={canOrderProducts ? handleAddToCart : null}
          onQuickView={(p) => setSelectedProductModal(p)}
          actionLabel="Add to Cart"
        />
      ) : null}

      {!loading && !filteredProducts.length ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center bg-white shadow-md">
          <span className="text-3xl">🌾</span>
          <h3 className="mt-2 text-lg font-bold text-slate-900">No produce matches your filters</h3>
          <p className="mt-1 text-sm text-slate-600">
            Try adjusting your search criteria, selecting a different category, or resetting filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 rounded-full bg-teal-800 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-teal-900"
          >
            Clear All Filters
          </button>
        </div>
      ) : null}

      {/* Quick View Modal */}
      {selectedProductModal && (
        <ProductModal
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={handleAddToCart}
          canOrder={canOrderProducts}
        />
      )}

      {/* Redirect Prompts Modal */}
      {redirectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="surface-panel max-w-sm w-full p-6 text-center shadow-2xl border border-white/60 rounded-[1.85rem] bg-white">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 text-2xl mb-4">
              🛒
            </span>
            <h3 className="text-xl font-bold text-slate-950 font-serif">Added to Cart!</h3>
            <p className="mt-2 text-sm text-slate-650">
              <strong>{redirectingProduct.productName}</strong> has been added. Redirecting to your cart in <span className="font-bold text-emerald-800">{countdown}s</span>...
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="w-full rounded-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Go to Cart Now
              </button>
              <button
                type="button"
                onClick={() => setRedirectingProduct(null)}
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


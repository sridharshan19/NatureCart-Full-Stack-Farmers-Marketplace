import { useState } from "react";
import carrotImage from "../../assets/Carrot image.jpg";
import heroImage from "../../assets/hero.png";
import potatoImage from "../../assets/Potato.jpeg";
import tomatoImage from "../../assets/Tomato.jpg";
import { API_BASE_URL } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

const productImageMap = {
  carrot: carrotImage,
  carrots: carrotImage,
  potato: potatoImage,
  potatoes: potatoImage,
  tomato: tomatoImage,
  tomatoes: tomatoImage,
  tomoto: tomatoImage,
  tomotos: tomatoImage,
};

const resolveImageSource = (image) => {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/uploads/") || image.startsWith("/")) return `${API_BASE_URL}${image}`;
  return "";
};

const getPrimaryImage = (product) => {
  if (!product) return heroImage;
  const uploadedImage = resolveImageSource(product.image);
  if (uploadedImage) return uploadedImage;
  const normalizedName = product.productName?.trim().toLowerCase();
  return productImageMap[normalizedName] || heroImage;
};

export default function ProductModal({ product, onClose, onAddToCart, canOrder }) {
  const [selectedQty, setSelectedQty] = useState(1);
  const [imageSrc, setImageSrc] = useState(getPrimaryImage(product));

  if (!product) return null;

  const farmName =
    typeof product.farmerId === "object"
      ? product.farmerId?.farmName || product.farmerId?.name || "Local Regional Farm"
      : "Local Regional Farm";

  const isOutOfStock = Number(product.quantity || 0) <= 0;

  const handleAdd = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product, selectedQty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="surface-panel relative max-w-xl w-full p-6 shadow-2xl border border-white/80 rounded-[2rem] bg-white text-slate-900 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
        >
          ✕
        </button>

        <div className="grid gap-6 md:grid-cols-2 items-center">
          {/* Image Column */}
          <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-100 border border-slate-200">
            <img
              src={imageSrc}
              alt={product.productName}
              className="h-64 w-full object-cover"
              onError={() => setImageSrc(heroImage)}
            />
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-emerald-800/90 backdrop-blur px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                🌿 Organic Certified
              </span>
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-700">
                {product.category || "Fresh Produce"}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 font-serif">
                {product.productName}
              </h2>
              <p className="mt-1 text-xs text-slate-500 font-medium">
                Sourced from <span className="text-teal-800 font-semibold">{farmName}</span>
              </p>
            </div>

            <div className="flex items-baseline gap-3 border-y border-slate-100 py-3">
              <span className="text-3xl font-extrabold text-emerald-800">
                {formatCurrency(product.price)}
              </span>
              <span className="text-sm text-amber-800 font-bold">/ {product.unit || "kg"}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Stock Status:</span>
                <span
                  className={`font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isOutOfStock
                      ? "bg-rose-100 text-rose-700"
                      : product.quantity < 5
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : product.quantity < 5
                    ? `Low Stock (${product.quantity} ${product.unit || "kg"} left)`
                    : `${product.quantity} ${product.unit || "kg"} available`}
                </span>
              </div>

              {!isOutOfStock && canOrder && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-800"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900">{selectedQty}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedQty((q) => Math.min(product.quantity, q + 1))}
                      className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 font-bold text-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {canOrder ? (
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className="w-full rounded-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isOutOfStock ? "Sold Out" : `Add ${selectedQty} to Basket`}
              </button>
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center text-xs font-semibold text-slate-600">
                Log in as a consumer to purchase produce.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

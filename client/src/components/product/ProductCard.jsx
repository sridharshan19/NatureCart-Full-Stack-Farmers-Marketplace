import { useEffect, useState } from "react";
import carrotImage from "../../assets/Carrot image.jpg";
import heroImage from "../../assets/hero.png";
import potatoImage from "../../assets/Potato.jpeg";
import tomatoImage from "../../assets/Tomato.jpg";
import { API_BASE_URL } from "../../services/api";

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

const getMappedImage = (product) => {
  const normalizedName = product.productName?.trim().toLowerCase();
  return productImageMap[normalizedName] || heroImage;
};

const resolveImageSource = (image) => {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/uploads/") || image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  return "";
};

const getPrimaryImage = (product) => {
  const uploadedImage = resolveImageSource(product.image);
  return uploadedImage || getMappedImage(product);
};

export default function ProductCard({
  product,
  onAdd,
  onQuickView,
  actionLabel = "Add to Cart",
}) {
  const [imageSrc, setImageSrc] = useState(getPrimaryImage(product));

  useEffect(() => {
    setImageSrc(getPrimaryImage(product));
  }, [product]);

  const fallbackImage = getMappedImage(product);
  const qty = Number(product.quantity || 0);
  const isOutOfStock = qty <= 0;
  const isLowStock = qty > 0 && qty < 5;

  const farmName =
    typeof product.farmerId === "object"
      ? product.farmerId?.farmName || product.farmerId?.name
      : null;

  return (
    <article className="section-card-strong color-pop overflow-hidden rounded-[1.85rem] border border-white/80 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-2xl group flex flex-col justify-between">
      <div>
        <div className="relative overflow-hidden rounded-[1.4rem]">
          <img
            src={imageSrc}
            alt={product.productName}
            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              if (imageSrc !== fallbackImage) {
                setImageSrc(fallbackImage);
              }
            }}
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur ${
                isOutOfStock
                  ? "bg-rose-800/90"
                  : isLowStock
                  ? "bg-amber-700/90"
                  : "bg-emerald-800/90"
              }`}
            >
              {isOutOfStock ? "Sold Out" : isLowStock ? `Only ${qty} left` : "In Stock"}
            </span>

            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="pointer-events-auto rounded-full bg-white/90 hover:bg-white text-slate-800 p-2 text-xs font-bold shadow-lg transition hover:scale-110"
                title="Quick View"
              >
                👁️
              </button>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/60 via-amber-950/20 to-transparent px-4 py-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/85">
                  {product.category || "Fresh produce"}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white leading-tight">
                  {product.productName}
                </h2>
                {farmName && (
                  <p className="text-[11px] text-amber-200 font-medium">🌾 {farmName}</p>
                )}
              </div>
              <p className="rounded-full bg-[linear-gradient(135deg,#fff3cf_0%,#ffffff_100%)] px-3.5 py-1.5 text-xs font-black text-slate-900 shadow-md whitespace-nowrap">
                Rs. {product.price} / {product.unit || "kg"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 px-1">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Available stock</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{product.quantity} {product.unit || "kg"}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
              isOutOfStock
                ? "bg-rose-100 text-rose-700"
                : isLowStock
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Inventory" : "Harvest Ready"}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {onAdd ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={isOutOfStock}
              className="flex-1 rounded-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-emerald-950/20 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOutOfStock ? "Out of Stock" : actionLabel}
            </button>
            {onQuickView && (
              <button
                type="button"
                onClick={() => onQuickView(product)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-3 text-slate-700 font-semibold hover:bg-slate-50 transition"
                title="Inspect Product"
              >
                🔍
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100/60 p-3 text-center text-xs font-semibold text-emerald-800/80 tracking-wide uppercase">
            🌿 Consumer Ordering Enabled
          </div>
        )}
      </div>
    </article>
  );
}


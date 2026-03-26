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

export default function ProductCard({ product, onAdd, actionLabel = "Add to Cart" }) {
  const [imageSrc, setImageSrc] = useState(getPrimaryImage(product));

  useEffect(() => {
    setImageSrc(getPrimaryImage(product));
  }, [product]);

  const fallbackImage = getMappedImage(product);

  return (
    <article className="section-card-strong color-pop overflow-hidden rounded-[1.85rem] border border-white/80 p-4 transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative overflow-hidden rounded-[1.4rem]">
        <img
          src={imageSrc}
          alt={product.productName}
          className="h-52 w-full object-cover"
          onError={() => {
            if (imageSrc !== fallbackImage) {
              setImageSrc(fallbackImage);
            }
          }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/30 via-amber-950/8 to-transparent px-4 py-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/75">
                {product.category || "Fresh produce"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">{product.productName}</h2>
            </div>
            <p className="rounded-full bg-[linear-gradient(135deg,#fff3cf_0%,#ffffff_100%)] px-4 py-2 text-sm font-semibold text-slate-900">
              Rs. {product.price}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Available stock</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{product.quantity} units</p>
        </div>
        <span className="rounded-full bg-[linear-gradient(135deg,#dcfce7_0%,#fef3c7_100%)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Ready
        </span>
      </div>

      {onAdd ? (
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-5 w-full rounded-full bg-[linear-gradient(135deg,#49ba8f_0%,#f3a34d_100%)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:brightness-95"
        >
          {actionLabel}
        </button>
      ) : (
        <p className="mt-5 rounded-full bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
          Ordering is enabled for consumer accounts.
        </p>
      )}
    </article>
  );
}

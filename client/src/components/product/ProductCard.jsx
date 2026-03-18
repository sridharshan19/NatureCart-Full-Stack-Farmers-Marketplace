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
    <div className="rounded-[1.75rem] border border-white/60 bg-white/95 p-4 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <img
        src={imageSrc}
        alt={product.productName}
        className="h-44 w-full rounded-2xl object-cover"
        onError={() => {
          if (imageSrc !== fallbackImage) {
            setImageSrc(fallbackImage);
          }
        }}
      />

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{product.productName}</h2>
          <p className="text-sm uppercase tracking-wide text-amber-700">{product.category}</p>
        </div>
        <p className="font-semibold text-[#0f766e]">Rs. {product.price}</p>
      </div>

      <p className="mt-2 text-sm text-slate-500">Stock: {product.quantity}</p>

      {onAdd ? (
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-4 w-full rounded-full bg-[#b45309] py-3 text-sm font-semibold text-white transition hover:bg-[#92400e]"
        >
          {actionLabel}
        </button>
      ) : (
        <p className="mt-4 rounded-full bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-500">
          Product ordering is available for consumer accounts.
        </p>
      )}
    </div>
  );
}

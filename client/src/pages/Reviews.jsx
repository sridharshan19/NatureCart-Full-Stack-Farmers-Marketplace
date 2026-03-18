import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { getReviews } from "../services/reviewService";
import { getErrorMessage, getStoredUser } from "../utils/helpers";

const ratingOptions = [1, 2, 3, 4, 5];
const filledStar = "\u2605";

export default function Reviews() {
  const user = getStoredUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" || user?.role === "farmer") {
      loadReviews();
      return;
    }

    setLoading(false);
  }, [showError, user?.role]);

  const renderStars = (rating) =>
    ratingOptions.map((star) => (
      <span key={star} className={star <= rating ? "text-amber-500" : "text-slate-300"}>
        {filledStar}
      </span>
    ));

  if (!user || (user.role !== "admin" && user.role !== "farmer")) {
    return (
      <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
        <p className="mt-3 text-slate-600">
          Login as an admin or farmer to view customer reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#1f2937_0%,#0f766e_55%,#b45309_100%)] p-8 text-white shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200">
          {user.role === "admin" ? "Admin review board" : "Farmer feedback"}
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          {user.role === "admin" ? "All farmer reviews" : "Your customer reviews"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-100/90">
          {user.role === "admin"
            ? "Review all customer feedback shared across the marketplace."
            : "Read the latest customer ratings and comments for your completed orders."}
        </p>
      </section>

      {loading ? <Loader label="Loading reviews..." /> : null}

      {!loading && reviews.length ? (
        <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {review.farmerId?.farmName || review.farmerId?.name || "Farmer"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>Consumer: {review.consumerId?.name || "Unknown"}</span>
                      <span className="text-slate-300">|</span>
                      <span className="flex text-base leading-none">
                        {renderStars(review.rating)}
                      </span>
                      <span>{review.rating}/5</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>Order #{review.orderId?._id?.slice(-8) || "N/A"}</p>
                    <p>
                      {review.orderId?.pickupDate || "Pickup date pending"} at{" "}
                      {review.orderId?.pickupTime || "Pickup time pending"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  {review.comment || "No written comment provided."}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !reviews.length ? (
        <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-xl">
          <p className="text-slate-500">No reviews available yet.</p>
        </div>
      ) : null}
    </div>
  );
}

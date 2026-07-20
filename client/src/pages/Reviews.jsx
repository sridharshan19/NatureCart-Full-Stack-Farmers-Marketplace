import { useEffect, useMemo, useState } from "react";
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
  const [filterRating, setFilterRating] = useState("all");
  const { showError } = useToast();

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data || []);
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

  const ratingSummary = useMemo(() => {
    if (!reviews.length) return { average: 0, total: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const average = (sum / total).toFixed(1);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(Number(r.rating || 0));
      if (counts[star] !== undefined) counts[star] += 1;
    });

    return { average, total, counts };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (filterRating === "all") return reviews;
    return reviews.filter((r) => Math.round(Number(r.rating)) === Number(filterRating));
  }, [reviews, filterRating]);

  const renderStars = (rating) =>
    ratingOptions.map((star) => (
      <span key={star} className={star <= rating ? "text-amber-500" : "text-slate-300"}>
        {filledStar}
      </span>
    ));

  if (!user || (user.role !== "admin" && user.role !== "farmer")) {
    return (
      <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Reviews</h1>
        <p className="mt-3 text-slate-600">
          Login as an admin or farmer to view customer reviews.
        </p>
      </div>
    );
  }

  const heroThemeClass = user.role === "farmer" ? "hero-farmer" : "hero-admin";

  return (
    <div className="space-y-5">
      <section className={`${heroThemeClass} p-8`}>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
            {user.role === "admin" ? "🛡️ Admin Review Audit" : "🌾 Farmer Customer Feedback"}
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-bold font-serif">
          {user.role === "admin" ? "All Farmer & Product Reviews" : "Your Customer Feedback & Ratings"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/90 leading-6">
          {user.role === "admin"
            ? "Review all customer feedback shared across the marketplace."
            : "Read the latest customer ratings and comments for your completed orders."}
        </p>
      </section>

      {loading ? <Loader label="Loading reviews..." /> : null}

      {!loading && reviews.length ? (
        <>
          {/* Summary Breakdown Card */}
          <section className="rounded-[1.75rem] border border-white/80 bg-white p-6 shadow-xl grid gap-6 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 text-center">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Average Rating</p>
              <p className="mt-2 text-5xl font-black text-amber-500">{ratingSummary.average}</p>
              <div className="mt-2 flex text-xl">{renderStars(Math.round(Number(ratingSummary.average)))}</div>
              <p className="mt-1 text-xs text-slate-500 font-medium">Based on {ratingSummary.total} customer reviews</p>
            </div>

            <div className="space-y-2 justify-center flex flex-col">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingSummary.counts[star];
                const pct = ratingSummary.total ? Math.round((count / ratingSummary.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <span className="w-12 text-right">{star} Stars</span>
                    <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-slate-500">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow border border-slate-100">
            <h3 className="font-bold text-slate-900">Customer Feedback</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Filter Stars:</span>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars Only</option>
                <option value="4">4 Stars Only</option>
                <option value="3">3 Stars Only</option>
                <option value="2">2 Stars Only</option>
                <option value="1">1 Star Only</option>
              </select>
            </div>
          </div>

          <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-slate-100/70"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-slate-900">
                        {review.farmerId?.farmName || review.farmerId?.name || "Farmer"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span>Consumer: <strong className="text-slate-800">{review.consumerId?.name || "Unknown"}</strong></span>
                        <span className="text-slate-300">|</span>
                        <span className="flex text-base leading-none">
                          {renderStars(review.rating)}
                        </span>
                        <span className="font-bold text-slate-800">{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      <p className="font-medium text-slate-700">Order #{review.orderId?._id?.slice(-8).toUpperCase() || "N/A"}</p>
                      <p className="text-xs">
                        {review.orderId?.pickupDate || "Pickup date"} at{" "}
                        {review.orderId?.pickupTime || "Pickup time"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                    "{review.comment || "No written comment provided."}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {!loading && !reviews.length ? (
        <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-xl">
          <p className="text-slate-500">No reviews available yet.</p>
        </div>
      ) : null}
    </div>
  );
}


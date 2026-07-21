import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import {
  getConsumerOrders,
  getFarmerOrders,
  updateOrderStatus,
} from "../services/orderService";
import { createReview, getReviews } from "../services/reviewService";
import { formatCurrency, getErrorMessage, getStoredUser } from "../utils/helpers";
import { generateOrderInvoice } from "../utils/invoiceGenerator";

const statusStyles = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const getConfirmButtonClass = (status) => {
  if (status === "confirmed" || status === "completed") {
    return "bg-sky-600 hover:bg-sky-600 opacity-90";
  }

  return "";
};

const getCompleteButtonClass = (status) => {
  if (status === "completed") {
    return "bg-emerald-600 hover:bg-emerald-600 opacity-90";
  }

  if (status === "confirmed") {
    return "bg-emerald-500 hover:bg-emerald-600";
  }

  return "bg-[#0f766e]";
};

const ratingOptions = [1, 2, 3, 4, 5];
const filledStar = "\u2605";

export default function Orders() {
  const user = getStoredUser();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReviewKey, setSubmittingReviewKey] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const { showError, showSuccess } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const requests = [
        user?.role === "consumer" ? getConsumerOrders() : getFarmerOrders(),
      ];

      if (user?.role === "consumer") {
        requests.push(getReviews());
      }

      const [orderData, reviewData] = await Promise.all(requests);
      setOrders(orderData || []);
      setReviews(reviewData || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user?.role, showError]);

  useEffect(() => {
    if (user?.role === "consumer" || user?.role === "farmer" || user?.role === "admin") {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user?.role, loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = order.scopedStatus || order.status;
      const matchesStatus =
        statusFilter === "all" || currentStatus.toLowerCase() === statusFilter.toLowerCase();

      const searchLower = orderSearch.trim().toLowerCase();
      const matchesSearch =
        !searchLower ||
        order._id?.toLowerCase().includes(searchLower) ||
        order.consumerId?.name?.toLowerCase().includes(searchLower) ||
        order.consumerId?.email?.toLowerCase().includes(searchLower) ||
        (order.products || []).some((p) =>
          p.productName?.toLowerCase().includes(searchLower)
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, orderSearch]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      showSuccess(`Order status updated to ${status}.`);
      await loadOrders();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const getReviewKey = (orderId, farmerId) => `${orderId}-${farmerId}`;

  const getReviewDraft = (orderId, farmerId) =>
    reviewDrafts[getReviewKey(orderId, farmerId)] || { rating: "5", comment: "" };

  const setReviewDraft = (orderId, farmerId, field, value) => {
    const reviewKey = getReviewKey(orderId, farmerId);
    setReviewDrafts((current) => ({
      ...current,
      [reviewKey]: {
        ...(current[reviewKey] || { rating: "5", comment: "" }),
        [field]: value,
      },
    }));
  };

  const getExistingReview = (orderId, farmerId) =>
    reviews.find(
      (review) =>
        review.orderId?._id?.toString() === orderId.toString() &&
        review.farmerId?._id?.toString() === farmerId.toString()
    );

  const renderStars = (rating) =>
    ratingOptions.map((star) => (
      <span key={star} className={star <= rating ? "text-amber-500" : "text-slate-300"}>
        {filledStar}
      </span>
    ));

  const handleReviewSubmit = async (orderId, farmerId) => {
    const draft = getReviewDraft(orderId, farmerId);
    const reviewKey = getReviewKey(orderId, farmerId);

    try {
      setSubmittingReviewKey(reviewKey);
      await createReview({
        orderId,
        farmerId,
        rating: Number(draft.rating),
        comment: draft.comment,
      });
      showSuccess("Review submitted successfully.");
      setReviewDrafts((current) => ({
        ...current,
        [reviewKey]: { rating: "5", comment: "" },
      }));
      await loadOrders();
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSubmittingReviewKey("");
    }
  };

  const getConsumerReviewTargets = (order) => {
    const farmerMap = new Map();

    order.products.forEach((product) => {
      const farmerId =
        typeof product.farmerId === "object" ? product.farmerId?._id : product.farmerId;

      if (!farmerId) {
        return;
      }

      const existing = farmerMap.get(farmerId.toString());
      const productStatus = product.status || order.status;

      if (!existing) {
        farmerMap.set(farmerId.toString(), {
          farmerId: farmerId.toString(),
          farmerName: product.farmerId?.farmName || product.farmerId?.name || "Farmer",
          statuses: [productStatus],
        });
        return;
      }

      existing.statuses.push(productStatus);
    });

    return Array.from(farmerMap.values()).map((entry) => ({
      ...entry,
      canReview: entry.statuses.every((status) => status === "completed"),
    }));
  };

  if (!user) {
    return (
      <div className="rounded-[2rem] bg-white/90 p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <p className="mt-3 text-slate-600">
          Login to track your orders or manage fulfillment activity.
        </p>
      </div>
    );
  }

  const heroThemeClass =
    user.role === "farmer"
      ? "hero-farmer"
      : user.role === "admin"
        ? "hero-admin"
        : "hero-consumer";

  return (
    <div className="space-y-5">
      <section className={`${heroThemeClass} p-8`}>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
            {user.role === "farmer"
              ? "🌾 Farmer Order Fulfillment"
              : user.role === "admin"
                ? "🛡️ Admin Order Operations"
                : "🛒 Consumer Pickup Orders"}
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-bold font-serif">
          {user.role === "admin"
            ? "Admin Order Control Room"
            : user.role === "farmer"
              ? "Farmer Order Board & Receipts"
              : "Track Your Pickup Orders"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/90 leading-6">
          {user.role === "consumer"
            ? "Track every placed order, download official tax receipts, and check pickup timing from one page."
            : "Review current orders, confirm fulfillment, download tax receipts, and read customer reviews in one place."}
        </p>
      </section>

      {/* Filter and Controls Header */}
      <div className="rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-xl space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Search by Order ID, consumer name, or product..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-sm text-slate-800 outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={loadOrders} className="bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200">
              Refresh List
            </Button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Filter Status:
          </span>
          {["all", "pending", "confirmed", "completed"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition ${statusFilter === st
                ? "bg-teal-800 text-white shadow"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader label="Loading orders..." /> : null}

      {!loading && filteredOrders.length ? (
        <div className="grid gap-5">
          {filteredOrders.map((order) => {
            const currentStatus = order.scopedStatus || order.status;
            const reviewTargets = user.role === "consumer" ? getConsumerReviewTargets(order) : [];

            return (
              <article key={order._id} className="surface-panel p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 font-serif">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusStyles[currentStatus] || "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                      Pickup Window: <strong className="text-slate-800">{order.pickupDate}</strong> at <strong className="text-slate-800">{order.pickupTime}</strong>
                    </p>
                    {user.role === "consumer" ? (
                      <p className="text-sm text-slate-500">
                        Total Amount: <span className="font-extrabold text-emerald-800">{formatCurrency(order.totalAmount)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Consumer: <strong className="text-slate-800">{order.consumerId?.name || "Unknown"}</strong> ({order.consumerId?.email || "No email"})
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                        💵 Payment: {formatCurrency(order.totalAmount)} (Cash on Pickup)
                      </span>
                      <button
                        type="button"
                        onClick={() => generateOrderInvoice(order, user.role)}
                        className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        📄 Download Invoice (PDF)
                      </button>
                    </div>
                  </div>

                  {user.role === "consumer" ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => generateOrderInvoice(order, user.role)}
                        className="rounded-full bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 text-xs font-bold transition shadow"
                      >
                        📄 Tax Receipt / PDF
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleStatusUpdate(order._id, "confirmed")}
                        disabled={currentStatus === "confirmed" || currentStatus === "completed"}
                        className={getConfirmButtonClass(currentStatus)}
                      >
                        {currentStatus === "confirmed" || currentStatus === "completed"
                          ? "Confirmed"
                          : "Confirm Order"}
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(order._id, "completed")}
                        disabled={currentStatus === "completed"}
                        className={getCompleteButtonClass(currentStatus)}
                      >
                        {currentStatus === "completed" ? "Completed" : "Complete Pickup"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => generateOrderInvoice(order, user.role)}
                        className="rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-4 py-2 text-xs font-bold transition"
                      >
                        📄 Invoice
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {order.products.map((product, index) => (
                    <div key={`${order._id}-${index}`} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="font-bold text-slate-900">{product.productName}</p>
                      <p className="text-sm text-slate-600 mt-1">Quantity: {product.quantity} units</p>
                      <p className="text-sm text-slate-600">Unit Price: Rs. {product.price}</p>
                      {user.role !== "consumer" ? (
                        <p className="text-xs font-semibold text-teal-700 mt-1 uppercase tracking-wider">
                          Item status: {product.status || order.status}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                {user.role === "consumer" && reviewTargets.length ? (
                  <div className="mt-6 rounded-[1.5rem] border border-teal-100 bg-teal-50/60 p-5">
                    <h4 className="text-lg font-semibold text-slate-900 font-serif">Farmer reviews</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Share feedback for the farmers in this order once their items are completed.
                    </p>
                    <div className="mt-4 space-y-4">
                      {reviewTargets.map((target) => {
                        const existingReview = getExistingReview(order._id, target.farmerId);
                        const draft = getReviewDraft(order._id, target.farmerId);
                        const reviewKey = getReviewKey(order._id, target.farmerId);

                        return (
                          <div key={reviewKey} className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">{target.farmerName}</p>
                                <p className="text-sm text-slate-500">
                                  {target.canReview
                                    ? "Eligible for review"
                                    : "Review unlocks after this farmer's items are completed"}
                                </p>
                              </div>
                              {existingReview ? (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                  Reviewed
                                </span>
                              ) : null}
                            </div>

                            {existingReview ? (
                              <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                  <span>Rating:</span>
                                  <span className="flex text-lg leading-none">
                                    {renderStars(existingReview.rating)}
                                  </span>
                                  <span>{existingReview.rating}/5</span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">
                                  {existingReview.comment || "No written comment provided."}
                                </p>
                              </div>
                            ) : (
                              <div className="mt-3 grid gap-3">
                                <div>
                                  <p className="mb-2 text-sm font-medium text-slate-700">
                                    Rate this farmer
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                      const isActive = Number(draft.rating) === rating;

                                      return (
                                        <button
                                          key={rating}
                                          type="button"
                                          onClick={() =>
                                            setReviewDraft(
                                              order._id,
                                              target.farmerId,
                                              "rating",
                                              String(rating)
                                            )
                                          }
                                          disabled={!target.canReview}
                                          className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${isActive
                                            ? "border-amber-300 bg-amber-50 text-amber-700"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:text-amber-700"
                                            } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                                        >
                                          <span className="flex items-center gap-2">
                                            <span className="text-base leading-none">
                                              {renderStars(rating)}
                                            </span>
                                            <span>{rating}</span>
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <textarea
                                  rows="3"
                                  value={draft.comment}
                                  onChange={(event) =>
                                    setReviewDraft(
                                      order._id,
                                      target.farmerId,
                                      "comment",
                                      event.target.value
                                    )
                                  }
                                  disabled={!target.canReview}
                                  placeholder="Write your experience with this farmer."
                                  className="text-area-field disabled:bg-slate-100"
                                />
                                <Button
                                  onClick={() => handleReviewSubmit(order._id, target.farmerId)}
                                  disabled={!target.canReview || submittingReviewKey === reviewKey}
                                  className="w-full md:w-fit"
                                >
                                  {submittingReviewKey === reviewKey
                                    ? "Submitting Review..."
                                    : "Submit Review"}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}

      {!loading && !filteredOrders.length ? (
        <div className="rounded-[1.75rem] bg-white p-8 text-center shadow-xl">
          <p className="text-slate-500">No orders match the selected filters or search terms.</p>
        </div>
      ) : null}
    </div>
  );
}


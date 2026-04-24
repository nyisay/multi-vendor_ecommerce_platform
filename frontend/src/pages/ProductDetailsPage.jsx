import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { cartApi, getImageUrl, productApi, wishlistApi } from "../services/api";
import {
  getRecentlyViewedProducts,
  saveRecentlyViewedProduct,
} from "../services/recentlyViewed";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Select from "../components/ui/Select";
import { Card, CardBody } from "../components/ui/Card";

const DETAIL_SURFACES = [
  "bg-amber-50 text-amber-950 ring-amber-200",
  "bg-sky-50 text-sky-950 ring-sky-200",
  "bg-emerald-50 text-emerald-950 ring-emerald-200",
];

const REVIEW_RATINGS = [1, 2, 3, 4, 5];

const toEntityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id;
  return String(value);
};

const hasReactionFromUser = (values, userId) => {
  if (!Array.isArray(values) || !userId) {
    return false;
  }

  return values.some((value) => toEntityId(value) === userId);
};

const formatReviewDate = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const getCategoryName = (item) => item.categoryId?.name || item.categoryName || "Uncategorized";
const getVendorName = (item) => item.vendorId?.name || item.vendorName || "Unknown vendor";

function ReviewComposer({ currentUserReview, onSubmit, submitting }) {
  const [rating, setRating] = useState(
    currentUserReview?.rating ? String(currentUserReview.rating) : "5",
  );
  const [comment, setComment] = useState(currentUserReview?.comment || "");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      rating: Number(rating),
      comment,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.28)]"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
        {currentUserReview ? "Update your review" : "Write a review"}
      </p>
      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
        Share your experience with this item
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Your rating and comment are visible on this product page so other
        customers can react to your feedback.
      </p>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Rating
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REVIEW_RATINGS.map((value) => {
            const active = rating === String(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(String(value))}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                {value} / 5
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="review-comment"
          className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500"
        >
          Comment
        </label>
        <textarea
          id="review-comment"
          rows={5}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell other customers what stood out about this product."
          className="mt-3 w-full rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-amber-50/30 focus:ring-2 focus:ring-amber-200/60"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {currentUserReview
            ? "Posting again updates your existing review."
            : "You can submit one review for this product."}
        </p>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving review..."
            : currentUserReview
              ? "Update review"
              : "Post review"}
        </Button>
      </div>
    </form>
  );
}

function DiscoveryProductCard({ item, caption }) {
  return (
    <article className="overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_18px_55px_-44px_rgba(15,23,42,0.35)]">
      <div className="relative h-52">
        {item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-950">
            {getCategoryName(item)}
          </span>
          <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-black text-slate-950">
            ${item.price}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {caption}
          </p>
          <Link
            to={`/products/${item._id}`}
            className="mt-2 block text-xl font-black tracking-tight text-slate-950 transition hover:text-amber-700"
          >
            {item.name}
          </Link>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sold by {getVendorName(item)}.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 text-sm">
          <span className="font-semibold text-slate-500">Rating</span>
          <span className="font-black text-slate-950">
            {Number(item.averageRating || 0).toFixed(1)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reactionReviewId, setReactionReviewId] = useState("");
  const [deleteReviewId, setDeleteReviewId] = useState("");
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() =>
    getRecentlyViewedProducts().filter((item) => item._id !== id),
  );
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistSubmitting, setWishlistSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await productApi.getById(id);
        const [relatedResponse, wishlistResponse] = await Promise.all([
          data.categoryId?._id
            ? productApi.getAll({
                category: data.categoryId._id,
                limit: 5,
                sortBy: "newest",
              })
            : Promise.resolve({ items: [] }),
          user?.role === "customer"
            ? wishlistApi.getMine().catch(() => ({ items: [] }))
            : Promise.resolve({ items: [] }),
        ]);

        if (active) {
          const nextRecentlyViewed = saveRecentlyViewedProduct(data);
          setProduct(data);
          setRelatedProducts(
            (Array.isArray(relatedResponse.items) ? relatedResponse.items : [])
              .filter((item) => item._id !== data._id)
              .slice(0, 4),
          );
          setRecentlyViewed(nextRecentlyViewed.filter((item) => item._id !== data._id));
          setIsWishlisted(
            Array.isArray(wishlistResponse.items)
              ? wishlistResponse.items.some((item) => item._id === data._id)
              : false,
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id, user?._id, user?.role]);

  const allReviews = product?.reviews || [];
  const currentUserReview = allReviews.find(
    (review) => toEntityId(review.userId) === user?._id,
  );
  const averageRating = Number(product?.averageRating || 0).toFixed(1);
  const reviewCount = allReviews.length;
  const canManageReviews =
    user?.role === "vendor" && toEntityId(product?.vendorId) === user._id;

  const filteredReviews = allReviews.filter((review) => {
    if (reviewRatingFilter === "all") {
      return true;
    }

    return String(review.rating) === reviewRatingFilter;
  });

  const reviews = [...filteredReviews].sort((left, right) => {
    const leftLikeCount = Array.isArray(left.likes) ? left.likes.length : 0;
    const rightLikeCount = Array.isArray(right.likes) ? right.likes.length : 0;
    const leftDate = new Date(left.updatedAt || left.createdAt || 0).getTime();
    const rightDate = new Date(right.updatedAt || right.createdAt || 0).getTime();

    if (reviewSort === "oldest") {
      return leftDate - rightDate;
    }

    if (reviewSort === "highest") {
      return right.rating - left.rating || rightDate - leftDate;
    }

    if (reviewSort === "lowest") {
      return left.rating - right.rating || rightDate - leftDate;
    }

    if (reviewSort === "most_liked") {
      return rightLikeCount - leftLikeCount || rightDate - leftDate;
    }

    return rightDate - leftDate;
  });

  const handleAddCart = async (productId = id) => {
    try {
      await cartApi.add(productId, 1);
      showToast("Added to cart", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    const nextComment = comment.trim();
    if (!rating) {
      showToast("Select a rating before posting your review", "error");
      return;
    }

    if (!nextComment) {
      showToast("Add a review comment before posting", "error");
      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await productApi.addReview(id, {
        rating,
        comment: nextComment,
      });
      setProduct(response.product);
      showToast(response.message || "Review saved", "success");
    } catch (err) {
      showToast(err.message || "Could not save review", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReaction = async (reviewId, reaction) => {
    setReactionReviewId(reviewId);

    try {
      const response = await productApi.reactToReview(id, reviewId, { reaction });
      setProduct(response.product);
    } catch (err) {
      showToast(err.message || "Could not save reaction", "error");
    } finally {
      setReactionReviewId("");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm("Delete this customer review?");
    if (!confirmed) {
      return;
    }

    setDeleteReviewId(reviewId);

    try {
      const response = await productApi.removeReview(id, reviewId);
      setProduct(response.product);
      showToast(response.message || "Review deleted", "success");
    } catch (err) {
      showToast(err.message || "Could not delete review", "error");
    } finally {
      setDeleteReviewId("");
    }
  };

  const handleWishlistToggle = async () => {
    setWishlistSubmitting(true);

    try {
      const response = isWishlisted
        ? await wishlistApi.remove(id)
        : await wishlistApi.add(id);
      setIsWishlisted(
        Array.isArray(response.items) ? response.items.some((item) => item._id === id) : false,
      );
      showToast(
        response.message || (isWishlisted ? "Removed from wishlist" : "Added to wishlist"),
        "success",
      );
    } catch (err) {
      showToast(err.message || "Could not update wishlist", "error");
    } finally {
      setWishlistSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-[1.6rem] border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
        {error}
      </p>
    );
  }

  if (!product) return null;

  return (
    <section className="space-y-6 md:space-y-8">
      <header className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_82%_20%,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#111827_54%,_#1e293b_100%)] px-6 py-7 text-white shadow-[0_30px_90px_-52px_rgba(15,23,42,0.95)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[14%] h-48 w-48 rounded-full bg-sky-300/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Link
              to="/products"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 transition hover:bg-white/15"
            >
              Back to shop
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge variant="neutral">{getCategoryName(product)}</Badge>
              <Badge variant={product.stock > 0 ? "success" : "danger"}>
                {product.stock > 0 ? "In stock" : "Out of stock"}
              </Badge>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Sold by {getVendorName(product)} in a shopping flow designed to
              feel curated, clear, and purchase-ready.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Price
              </p>
              <p className="mt-2 text-2xl font-black text-white">${product.price}</p>
            </article>
            <article className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Rating
              </p>
              <p className="mt-2 text-2xl font-black text-white">{averageRating}</p>
            </article>
            <article className="rounded-[1.4rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                Stock
              </p>
              <p className="mt-2 text-2xl font-black text-white">{product.stock}</p>
            </article>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)]">
            <div className="relative">
              {product.imageUrl ? (
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="h-[420px] w-full object-cover sm:h-[520px]"
                />
              ) : (
                <div className="h-[420px] w-full bg-[linear-gradient(135deg,_#e2e8f0,_#f8fafc_42%,_#cbd5e1)] sm:h-[520px]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 text-white backdrop-blur">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                    Vendor spotlight
                  </p>
                  <p className="mt-2 text-xl font-black tracking-tight text-white">
                    {getVendorName(product)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    Product presentation should feel premium before the customer
                    even decides to purchase.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${DETAIL_SURFACES[0]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Category
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {getCategoryName(product)}
              </p>
            </article>

            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${DETAIL_SURFACES[1]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Inventory
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {product.stock > 0 ? `${product.stock} available` : "Sold out"}
              </p>
            </article>

            <article
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${DETAIL_SURFACES[2]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Rating
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">{averageRating} / 5</p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-[1.8rem] border border-slate-200 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
              <CardBody className="space-y-3 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Product story
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Details that help buyers commit faster
                </h2>
                <p className="text-sm leading-7 text-slate-600">
                  {product.description || "Details will be updated soon."}
                </p>
              </CardBody>
            </Card>

            <Card className="rounded-[1.8rem] border border-slate-200 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.35)]">
              <CardBody className="space-y-4 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Quick specs
                </p>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500">Stock</span>
                    <span className="font-black text-slate-950">{product.stock}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-500">Rating</span>
                    <span className="font-black text-slate-950">{averageRating}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-500">Category</span>
                    <span className="font-black text-slate-950">{getCategoryName(product)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.38)]">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Customer reviews
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                    Ratings, comments, and community reactions
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-70">
                      Average rating
                    </p>
                    <p className="mt-1 text-2xl font-black">{averageRating}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sky-950">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-70">
                      Total reviews
                    </p>
                    <p className="mt-1 text-2xl font-black">{reviewCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <CardBody className="space-y-6 p-6">
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Review activity
                  </p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    What shoppers are saying
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Customers can leave one review per product, update it later,
                    and other customers can sort what they see before reacting to
                    the most helpful comments.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-[1.3rem] bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-slate-500">
                        Current rating
                      </span>
                      <span className="text-lg font-black text-slate-950">
                        {averageRating} / 5
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[1.3rem] bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-slate-500">
                        Review count
                      </span>
                      <span className="text-lg font-black text-slate-950">
                        {reviewCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[1.3rem] bg-white px-4 py-3">
                      <span className="text-sm font-semibold text-slate-500">
                        Vendor moderation
                      </span>
                      <span className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === "customer" ? (
                  <ReviewComposer
                    key={`${product._id}:${user._id}:${currentUserReview?._id || "new"}`}
                    currentUserReview={currentUserReview}
                    onSubmit={handleReviewSubmit}
                    submitting={reviewSubmitting}
                  />
                ) : (
                  <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.28)]">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      Review access
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      Customer accounts can review this product
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Customers can post ratings, write comments, and react to
                      other customer reviews. Vendors can moderate comments on
                      their own products.
                    </p>

                    {!user ? (
                      <div className="mt-5">
                        <Link to="/login" className="inline-flex">
                          <Button>Login to review</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        You are signed in as a {user.role}. Review submission and
                        reactions are reserved for customer accounts.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Sort reviews
                  </p>
                  <Select value={reviewSort} onChange={(event) => setReviewSort(event.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest rating</option>
                    <option value="lowest">Lowest rating</option>
                    <option value="most_liked">Most liked</option>
                  </Select>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    Filter by rating
                  </p>
                  <Select
                    value={reviewRatingFilter}
                    onChange={(event) => setReviewRatingFilter(event.target.value)}
                  >
                    <option value="all">All ratings</option>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => {
                    const reviewUserId = toEntityId(review.userId);
                    const customerCanReact =
                      user?.role === "customer" && reviewUserId !== user._id;
                    const likedByViewer = hasReactionFromUser(review.likes, user?._id);
                    const dislikedByViewer = hasReactionFromUser(review.dislikes, user?._id);
                    const reviewLikeCount = Array.isArray(review.likes) ? review.likes.length : 0;
                    const reviewDislikeCount = Array.isArray(review.dislikes)
                      ? review.dislikes.length
                      : 0;
                    const reviewAuthorName = review.userId?.name || "Customer";
                    const isDeleting = deleteReviewId === review._id;
                    const isReacting = reactionReviewId === review._id;

                    return (
                      <article
                        key={review._id}
                        className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-42px_rgba(15,23,42,0.28)]"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                                {review.rating} / 5
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {formatReviewDate(review.updatedAt || review.createdAt)}
                              </span>
                              {reviewUserId === user?._id ? (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                                  Your review
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-3 text-lg font-black tracking-tight text-slate-950">
                              {reviewAuthorName}
                            </p>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                              {review.comment || "No comment provided."}
                            </p>
                          </div>

                          {canManageReviews ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete comment"}
                            </Button>
                          ) : null}
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              variant={likedByViewer ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleReaction(review._id, "like")}
                              disabled={!customerCanReact || isReacting}
                            >
                              Like {reviewLikeCount}
                            </Button>
                            <Button
                              variant={dislikedByViewer ? "danger" : "outline"}
                              size="sm"
                              onClick={() => handleReaction(review._id, "dislike")}
                              disabled={!customerCanReact || isReacting}
                            >
                              Dislike {reviewDislikeCount}
                            </Button>
                          </div>

                          <p className="text-sm text-slate-500">
                            {customerCanReact
                              ? "Customers can switch or remove their reaction."
                              : reviewUserId === user?._id
                                ? "You cannot react to your own review."
                                : user?.role === "vendor"
                                  ? "Vendor accounts can moderate but cannot react."
                                  : "Login as a customer to react to reviews."}
                          </p>
                        </div>
                      </article>
                    );
                  })
                ) : reviewCount > 0 ? (
                  <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-xl font-black tracking-tight text-slate-950">
                      No reviews match these filters
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Try another rating filter or switch the review sort mode.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <p className="text-xl font-black tracking-tight text-slate-950">
                      No reviews yet
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Be the first customer to rate this product and leave a
                      comment for other shoppers.
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {relatedProducts.length > 0 ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Related products
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                    More from the same category
                  </h2>
                </div>
                <Link
                  to={`/products?category=${encodeURIComponent(product.categoryId?._id || "")}`}
                  className="text-sm font-semibold text-slate-950 transition hover:text-amber-700"
                >
                  Explore this category
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {relatedProducts.map((item) => (
                  <DiscoveryProductCard key={item._id} item={item} caption="Related pick" />
                ))}
              </div>
            </section>
          ) : null}

          {recentlyViewed.length > 0 ? (
            <section className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Recently viewed
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                  Continue where you left off
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {recentlyViewed.slice(0, 4).map((item) => (
                  <DiscoveryProductCard key={item._id} item={item} caption="Viewed recently" />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="xl:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)]">
              <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Buying panel
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
                  Ready to add this to the cart?
                </h2>
              </div>

              <CardBody className="space-y-5 p-6">
                <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                    Total price
                  </p>
                  <p className="mt-2 text-4xl font-black tracking-tight text-white">
                    ${product.price}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Sold by {getVendorName(product)}.
                  </p>
                </div>

                {user?.role === "customer" ? (
                  <div className="grid gap-3">
                    <Button onClick={() => handleAddCart()} fullWidth disabled={product.stock <= 0}>
                      Add to cart
                    </Button>
                    <Button
                      variant={isWishlisted ? "secondary" : "outline"}
                      fullWidth
                      onClick={handleWishlistToggle}
                      disabled={wishlistSubmitting}
                    >
                      {wishlistSubmitting
                        ? "Updating wishlist..."
                        : isWishlisted
                          ? "Saved in wishlist"
                          : "Save to wishlist"}
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" className="block">
                    <Button fullWidth>Login as customer to buy</Button>
                  </Link>
                )}

                <div className="grid gap-3 rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Why shop here
                  </p>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                    <p className="text-sm leading-6 text-slate-700">
                      Secure checkout experience with a cleaner marketplace flow.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
                    <p className="text-sm leading-6 text-slate-700">
                      Structured for multi-vendor shopping without losing clarity.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
                    <p className="text-sm leading-6 text-slate-700">
                      Reliable support around every order and catalog interaction.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    Availability
                  </p>
                  <p className="mt-2 text-lg font-black tracking-tight text-slate-950">
                    {product.stock > 0 ? "Available for checkout" : "Currently unavailable"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {product.stock > 0
                      ? "This item can be added to the cart right now."
                      : "This item is visible in the catalog but cannot be purchased at the moment."}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

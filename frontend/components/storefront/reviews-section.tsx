"use client";

import { useState, useTransition } from "react";
import { Star, ThumbsUp, BadgeCheck, Pencil, Trash2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { submitReview, deleteReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface ReviewData {
  id: string;
  userId: string;
  rating: number;
  title: string | null;
  comment: string;
  verified: boolean;
  createdAt: Date;
  user: ReviewUser;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface ReviewsSectionProps {
  productId: string;
  initialReviews: ReviewData[];
  summary: ReviewSummary;
  myReview: { id: string; rating: number; title: string | null; comment: string } | null;
  currentUserId?: string | null;
}

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`transition-transform ${!readOnly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
          >
            <Star
              className={`${sizeClass} transition-colors ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-muted-foreground font-medium">{stars}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-muted-foreground">{count}</span>
    </div>
  );
}

export function ReviewsSection({
  productId,
  initialReviews,
  summary,
  myReview,
  currentUserId,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [reviewSummary, setReviewSummary] = useState(summary);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(myReview?.rating || 0);
  const [title, setTitle] = useState(myReview?.title || "");
  const [comment, setComment] = useState(myReview?.comment || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      try {
        await submitReview(productId, { rating, title: title.trim() || undefined, comment: comment.trim() });
        toast.success(myReview ? "Review updated!" : "Review submitted! Thank you.");
        setShowForm(false);
        setIsEditing(false);
        // Optimistic update
        window.location.reload(); // Simple: reload to get fresh data
      } catch (err: any) {
        toast.error(err.message || "Failed to submit review.");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteReview(productId);
        toast.success("Review deleted.");
        window.location.reload();
      } catch {
        toast.error("Failed to delete review.");
      }
    });
  };

  const startEdit = () => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title || "");
      setComment(myReview.comment);
    }
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <section id="reviews" className="mt-10 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">
          Customer Reviews
        </h2>
        {currentUserId && !myReview && !showForm && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Write a Review
          </Button>
        )}
      </div>

      {/* Rating Summary */}
      {reviewSummary.totalReviews > 0 && (
        <div className="bg-card border border-border rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left: overall score */}
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-6xl font-black tracking-tight">
              {reviewSummary.averageRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(reviewSummary.averageRating)} readOnly size="md" />
            <span className="text-xs text-muted-foreground">
              {reviewSummary.totalReviews.toLocaleString()} verified reviews
            </span>
          </div>
          {/* Right: distribution bars */}
          <div className="flex flex-col justify-center gap-1.5">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={reviewSummary.distribution[stars] || 0}
                total={reviewSummary.totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* My Review Display */}
      {myReview && !isEditing && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Your Review</span>
              <StarRating value={myReview.rating} readOnly size="sm" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-destructive hover:text-red-400 flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
          {myReview.title && (
            <p className="font-bold text-sm">{myReview.title}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{myReview.comment}</p>
        </div>
      )}

      {/* Review Form */}
      {showForm && currentUserId && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <h3 className="font-bold text-sm">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Rating *
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Summarize your experience..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              minLength={10}
              maxLength={2000}
              placeholder="Tell other shoppers what you think about this product..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
            <span className="text-[10px] text-muted-foreground">{comment.length}/2000</span>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl text-xs px-6"
            >
              {isPending ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs rounded-xl"
              onClick={() => { setShowForm(false); setIsEditing(false); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Sign-in prompt */}
      {!currentUserId && (
        <div className="text-center py-6 border border-dashed border-border rounded-2xl text-sm text-muted-foreground">
          <a href="/login" className="text-primary font-semibold hover:underline">Sign in</a> to write a review.
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No reviews yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border rounded-2xl p-5 space-y-3 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {(review.user.name || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{review.user.name || "Anonymous"}</span>
                      {review.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
                          <BadgeCheck className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <StarRating value={review.rating} readOnly size="sm" />
              </div>

              {review.title && (
                <p className="font-bold text-sm">{review.title}</p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

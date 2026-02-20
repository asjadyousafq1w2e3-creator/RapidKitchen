import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
}

interface ReviewSectionProps {
  productId: string;
}

const StarRating = ({
  rating,
  onRate,
  interactive = false,
  size = "w-5 h-5",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: string;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${size} transition-colors ${
              star <= (hover || rating)
                ? "fill-accent text-accent"
                : "fill-none text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const userReview = reviews.find((r) => r.user_id === user?.id);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setRating(review.rating);
    setTitle(review.title || "");
    setContent(review.content || "");
  };

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setContent("");
    setError("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (content.trim().length < 5) {
      setError("Review must be at least 5 characters.");
      return;
    }
    setSubmitting(true);

    if (editingId) {
      await supabase
        .from("reviews")
        .update({ rating, title: title.trim() || null, content: content.trim() })
        .eq("id", editingId);
    } else {
      await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user!.id,
        rating,
        title: title.trim() || null,
        content: content.trim(),
      });
    }

    resetForm();
    await fetchReviews();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    await fetchReviews();
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  return (
    <div className="mt-20">
      <h2 className="font-display text-3xl text-foreground mb-8">Customer Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Summary */}
        <div className="bg-secondary/50 rounded-2xl p-6 space-y-4 h-fit">
          <div className="text-center">
            <p className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} size="w-5 h-5" />
            <p className="text-sm text-muted-foreground mt-1">
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, i) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-muted-foreground">{star}</span>
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{
                      width: reviews.length
                        ? `${(ratingCounts[i] / reviews.length) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="w-6 text-right text-muted-foreground">{ratingCounts[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form + Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Form */}
          {user ? (
            !userReview || editingId ? (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-popover border border-border rounded-2xl p-6 space-y-4"
              >
                <h3 className="font-medium text-foreground">
                  {editingId ? "Edit Your Review" : "Write a Review"}
                </h3>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Rating</p>
                  <StarRating rating={rating} onRate={setRating} interactive size="w-7 h-7" />
                </div>

                <input
                  type="text"
                  placeholder="Review title (optional)"
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />

                <textarea
                  placeholder="Share your experience with this product..."
                  maxLength={1000}
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Submitting..." : editingId ? "Update Review" : "Submit Review"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.form>
            ) : null
          ) : (
            <div className="bg-secondary/50 rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">
                <Link to="/auth" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>{" "}
                to leave a review.
              </p>
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-secondary rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-popover border border-border rounded-2xl p-5 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <StarRating rating={review.rating} size="w-4 h-4" />
                        {review.title && (
                          <p className="font-medium text-foreground mt-1">{review.title}</p>
                        )}
                      </div>
                      {user?.id === review.user_id && !editingId && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(review)}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {review.content && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;

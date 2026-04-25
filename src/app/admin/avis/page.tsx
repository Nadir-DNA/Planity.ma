"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Search,
  Check,
  X,
  Loader2,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  bookingId: string;
  userId: string;
  salonId: string;
  overallRating: number;
  qualityRating?: number;
  timingRating?: number;
  receptionRating?: number;
  hygieneRating?: number;
  comment?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function AdminAvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Mock data
        const mockReviews: Review[] = [
          {
            id: "r1",
            bookingId: "b1",
            userId: "u1",
            salonId: "s1",
            overallRating: 5,
            qualityRating: 5,
            timingRating: 4,
            receptionRating: 5,
            hygieneRating: 5,
            comment: "Excellent salon ! L'équipe est très professionnelle et le résultat est parfait. Je recommande vivement.",
            status: "PENDING",
            user: { name: "Fatima Zahra" },
            createdAt: "2024-03-20T14:30:00Z",
          },
          {
            id: "r2",
            bookingId: "b2",
            userId: "u2",
            salonId: "s1",
            overallRating: 3,
            qualityRating: 3,
            timingRating: 2,
            receptionRating: 4,
            hygieneRating: 3,
            comment: "Correct mais un peu long d'attente. Le résultat est satisfaisant.",
            status: "PENDING",
            user: { name: "Ahmed Benali" },
            createdAt: "2024-03-18T10:15:00Z",
          },
          {
            id: "r3",
            bookingId: "b3",
            userId: "u3",
            salonId: "s2",
            overallRating: 1,
            qualityRating: 1,
            timingRating: 1,
            receptionRating: 2,
            hygieneRating: 1,
            comment: "Très déçu. Le salon était sale et le coiffeur n'a pas écouté mes demandes.",
            status: "PENDING",
            user: { name: "Khadija Mansouri" },
            createdAt: "2024-03-15T16:45:00Z",
          },
          {
            id: "r4",
            bookingId: "b4",
            userId: "u4",
            salonId: "s2",
            overallRating: 4,
            qualityRating: 4,
            timingRating: 5,
            receptionRating: 4,
            hygieneRating: 4,
            comment: "Très bon moment. L'équipe est accueillante et le service est de qualité.",
            status: "APPROVED",
            user: { name: "Youssef El Amrani" },
            createdAt: "2024-03-10T12:00:00Z",
          },
        ];
        setReviews(mockReviews);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (filter !== "all" && review.status !== filter.toUpperCase()) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        review.user.name.toLowerCase().includes(q) ||
        review.comment?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleModerate(reviewId: string, action: "APPROVED" | "REJECTED") {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: action } : r
      )
    );
    toast(
      action === "APPROVED" ? "Avis approuvé" : "Avis rejeté",
      { icon: action === "APPROVED" ? "✅" : "❌" }
    );
    if (selectedReview?.id === reviewId) {
      setSelectedReview(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function renderStars(rating: number, size: "sm" | "lg" = "sm") {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${size === "lg" ? "h-5 w-5" : "h-4 w-4"} ${
              i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modération des avis</h1>
          <p className="text-sm text-gray-500">
            {filteredReviews.length} avis à modérer
          </p>
        </div>
        <div className="flex gap-2">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "pending" ? "En attente" : f === "approved" ? "Approuvés" : f === "rejected" ? "Rejetés" : "Tous"}
            </Button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher par nom ou contenu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun avis</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-sm">
                        {review.user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.user.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <Badge
                        className={
                          review.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : review.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {review.status === "APPROVED" ? "Approuvé" : review.status === "REJECTED" ? "Rejeté" : "En attente"}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      {renderStars(review.overallRating)}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                    {/* Detailed ratings */}
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {review.qualityRating && (
                        <span>Qualité: {review.qualityRating}/5</span>
                      )}
                      {review.timingRating && (
                        <span>Timing: {review.timingRating}/5</span>
                      )}
                      {review.receptionRating && (
                        <span>Accueil: {review.receptionRating}/5</span>
                      )}
                      {review.hygieneRating && (
                        <span>Hygiène: {review.hygieneRating}/5</span>
                      )}
                    </div>
                  </div>
                  {review.status === "PENDING" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleModerate(review.id, "APPROVED")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleModerate(review.id, "REJECTED")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

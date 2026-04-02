"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X } from "lucide-react";

const mockReviews = [
  {
    id: "1",
    user: "Fatima Z.",
    salon: "Salon Elegance",
    rating: 5,
    comment: "Excellent service, equipe tres professionnelle !",
    date: "2024-03-18",
    status: "PENDING",
  },
  {
    id: "2",
    user: "Ahmed K.",
    salon: "Barber House",
    rating: 2,
    comment: "Tres decu, temps d'attente tres long et resultat moyen.",
    date: "2024-03-17",
    status: "PENDING",
  },
  {
    id: "3",
    user: "Leila B.",
    salon: "Spa Zenith",
    rating: 4,
    comment: "Bon hammam, personnel accueillant. Un peu cher.",
    date: "2024-03-16",
    status: "PENDING",
  },
  {
    id: "4",
    user: "Mohamed A.",
    salon: "Salon Elegance",
    rating: 5,
    comment: "Toujours au top ! Je recommande vivement.",
    date: "2024-03-15",
    status: "APPROVED",
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews);
  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  function updateStatus(id: string, status: string) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Moderation des avis</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pendingCount} avis en attente de moderation
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex space-x-2 mb-6">
        <Badge variant="default" className="cursor-pointer">
          En attente ({pendingCount})
        </Badge>
        <Badge variant="outline" className="cursor-pointer">
          Approuves
        </Badge>
        <Badge variant="outline" className="cursor-pointer">
          Rejetes
        </Badge>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{review.user}</span>
                    <span className="text-gray-400">sur</span>
                    <span className="font-medium text-gray-900">{review.salon}</span>
                    <Badge
                      variant={
                        review.status === "PENDING"
                          ? "warning"
                          : review.status === "APPROVED"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {review.status === "PENDING"
                        ? "En attente"
                        : review.status === "APPROVED"
                        ? "Approuve"
                        : "Rejete"}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-gray-400">{review.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                </div>

                {review.status === "PENDING" && (
                  <div className="flex space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => updateStatus(review.id, "APPROVED")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => updateStatus(review.id, "REJECTED")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

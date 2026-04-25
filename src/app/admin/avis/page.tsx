"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  salon: string;
  user: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: "1",
        salon: "Salon Elegance",
        user: "Fatima Z.",
        rating: 5,
        comment: "Excellent service, équipe très professionnelle !",
        status: "pending",
        createdAt: "2024-03-18",
      },
      {
        id: "2",
        salon: "Salon Elegance",
        user: "Ahmed K.",
        rating: 4,
        comment: "Très bon salon, je recommande. Un peu d'attente parfois.",
        status: "pending",
        createdAt: "2024-03-17",
      },
      {
        id: "3",
        salon: "Spa Zenith",
        user: "Leila B.",
        rating: 5,
        comment: "Le meilleur spa de Marrakech !",
        status: "approved",
        createdAt: "2024-03-15",
      },
      {
        id: "4",
        salon: "Barber House",
        user: "Mohammed R.",
        rating: 1,
        comment: "Service terrible, à éviter !",
        status: "pending",
        createdAt: "2024-03-14",
      },
    ];
    setReviews(mockReviews);
  }, []);

  const filteredReviews = reviews.filter((r) => r.status === filter);

  function approveReview(id: string) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r))
    );
  }

  function rejectReview(id: string) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Approuvé</Badge>;
      case "pending":
        return <Badge variant="warning">En attente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Avis clients</h1>

      <div className="flex items-center border rounded-lg mb-6">
        {["pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 text-sm font-medium ${
              filter === f
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "pending" ? "En attente" : f === "approved" ? "Approuvés" : "Rejetés"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {review.salon}
                    </h3>
                    {statusBadge(review.status)}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
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
                    <span className="text-sm text-gray-500 ml-2">
                      {review.user}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 flex items-start">
                    <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {review.createdAt}
                  </p>
                </div>
                {review.status === "pending" && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => approveReview(review.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => rejectReview(review.id)}
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

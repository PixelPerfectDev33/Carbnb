import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet,
  // Removed Alert as it is often deprecated in favor of custom UI
} from "react-native";

// ⚠️ IMPORTANT: Please ensure your project's module resolution is configured 
// to correctly map "@/lib/supabase" to your actual supabase client file.
// If you encounter an error here, you must change this path to a relative one (e.g., "../../lib/supabase") 
// or define the 'supabase' object directly in this file temporarily for testing.
import { supabase } from "@/lib/supabase";

// This CAR_ID is used for fetching data.
const CAR_ID = "38c6fd88-61e8-4ca9-9847-0775412da812";

// Define the expected shape of the review data
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  car_id: string;
  reviewer_id: string;
  likes: number;
  dislikes: number;
}

const TestReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch reviews directly using the car_id column
        // This relies on the 'reviews' table having a foreign key to 'cars'.
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            car_id,
            reviewer_id,
            likes,
            dislikes,
            reviewer:reviewer_id(id, name, email)
          `)
          .eq("car_id", CAR_ID)
          .limit(50); 

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError.message);
          setError(`Failed to fetch reviews: ${reviewsError.message}. Check RLS and database connection.`);
        } else {
          // Assuming all reviews with a car_id are relevant for display.
          console.log(reviewsData)
          setReviews(reviewsData as Review[] || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred. Is Supabase client configured?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // --- Rendering Logic ---

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading reviews for car ID: {CAR_ID}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.center}>
        <Text style={styles.errorTitle}>🚨 Data Fetching Error 🚨</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Reviews for Car (ID: {CAR_ID})</Text>

      {reviews.length === 0 ? (
        <View style={styles.center}>
            <Text style={styles.noReviews}>No reviews found for this car yet.</Text>
            <Text style={styles.noReviewsHint}>Check your database data and RLS policies.</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.card}>
            <View style={styles.reviewerInfo}>
              <Image
                source={{ uri: review.reviewer?.avatar_url || "https://placehold.co/50x50/10b981/ffffff?text=U" }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.name}>{review.reviewer?.name || "Anonymous User"}</Text>
                <Text style={styles.date}>
                    Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <Text style={styles.rating}>
                {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} 
                <Text style={styles.ratingNumber}> ({review.rating}/5)</Text>
            </Text>

            <Text style={styles.comment}>{review.comment}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default TestReviewsPage;

// StyleSheet for React Native/Expo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    minHeight: '100%',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#007bff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  errorHint: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
    textAlign: 'center',
  },
  noReviews: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  },
  noReviewsHint: {
    fontSize: 12,
    color: '#adb5bd',
    marginTop: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#10b981', // Emerald color
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#34d399',
  },
  name: { 
    fontWeight: "600",
    fontSize: 16,
    color: '#495057',
  },
  date: { 
    color: "#6c757d", 
    fontSize: 12, 
    marginTop: 2 
  },
  rating: { 
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fbbd23', // Yellow color for stars
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6c757d',
  },
  comment: { 
    fontSize: 14,
    lineHeight: 20,
    color: '#212529',
  },
});

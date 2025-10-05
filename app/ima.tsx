// app/test-reviews.tsx (or wherever your file is)
import React, { useState } from "react";
import { 
  View, 
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from 'expo-image';
import { SlideViewModal } from '@/components/SlideViewModal';

// 🔥 Fixed: removed extra spaces in URLs
const SAMPLE_IMAGES = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
];

const TestReviewsPage = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailContainer}
      >
        {SAMPLE_IMAGES.map((uri, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImageIndex(index)}
            style={styles.thumbnail}
          >
            <Image
              source={{ uri }}
              style={styles.thumbnailImage}
              contentFit="cover"
              placeholder="https://placehold.co/100x100/CCCCCC/999999?text=Thumb"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SlideViewModal
        visible={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        images={SAMPLE_IMAGES}
        initialIndex={selectedImageIndex ?? 0}
      />
    </View>
  );
};

export default TestReviewsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  thumbnailContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
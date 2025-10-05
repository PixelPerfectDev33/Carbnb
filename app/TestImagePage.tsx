// TestImagePage.tsx
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image'; // Only if using Expo
import { useRouter } from "expo-router";


// If NOT using Expo, replace with:
// import { Image } from 'react-native';

import { SlideViewModal } from '@/components/SlideViewModal';

const SAMPLE_IMAGES = [
  'https://picsum.photos/800/600?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/800/600?random=3',
  'https://picsum.photos/800/600?random=4',
  'https://picsum.photos/800/600?random=5',
];

export const TestImagePage: React.FC = () => {
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
              contentFit="cover" // expo-image property
              placeholder="https://placehold.co/100x100/CCCCCC/999999?text=Thumb"
              // For React Native core Image, use:
              // resizeMode="cover"
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
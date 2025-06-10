import { Article } from "@/src/features/newfeeds/interface/article";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PostProps {
  article: Article;
  onAccept: () => void;
  onReject: () => void;
}

const PostApproval: React.FC<PostProps> = ({ article, onAccept, onReject }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useTheme();
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(currentIndex);
  };

  const renderImage = (photos: Article["listPhoto"]) => {
    if (!photos || photos.length === 0) return null;
    return (
      <View style={styles.imageContainer}>
        <FlatList
          data={photos}
          keyExtractor={(item) => item._id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          renderItem={({ item }) => (
            <Image
              key={item._id}
              source={{ uri: item.url }}
              style={styles.postImage}
              resizeMode="contain"
            />
          )}
        />
        {/* Image counter */}
        <View style={styles.imageCounterContainer}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1}/{photos.length}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background, borderColor: Color.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: article.createdBy.avt[0]?.url || "" }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.username, { color: Color.textPrimary }]}>{article.createdBy.displayName}</Text>
          <Text style={[styles.handle, { color: Color.textSecondary }]}>@{article.createdBy._id}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={[styles.contentText, { color: Color.textPrimary }]}>{article.content}</Text>

      {/* Images */}
      {renderImage(article.listPhoto)}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton, { backgroundColor: Color.mainColor2 }]}
          onPress={onAccept}
        >
          <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Duyệt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton, { backgroundColor: Color.error }]}
          onPress={onReject}
        >
          <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Từ chối</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostApproval;

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  handle: {
    fontSize: 14,
    marginTop: 3,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  imageContainer: {
    position: "relative",
    width: SCREEN_WIDTH - 30, // Adjust this if your container padding changes
    height: 400,
    alignSelf: "center",
    overflow: "hidden",
  },
  postImage: {
    width: SCREEN_WIDTH - 30, // Image width should match container width if using paging
    height: 400,
  },
  imageCounterContainer: {
    position: "absolute",
    bottom: 10,
    right: 15,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {}, // Styles are applied inline
  rejectButton: {}, // Styles are applied inline
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
// src/features/newfeeds/components/post/Post.tsx
import EditModal from "@/src/features/newfeeds/components/EditModal/EditModal";
import { usePostActions } from "@/src/features/newfeeds/components/post/usePost";
import ReportModal from "@/src/features/newfeeds/components/ReportModal/ReportModal";
import { Article } from "@/src/features/newfeeds/interface/article";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ResizeMode, Video } from "expo-av";
import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Color = getColor();

interface PostProps {
  article: Article;
  userId: string;
  onCommentPress: (article: Article) => void;
  onLike: () => void;
  deleteArticle: (articleId: string) => void;
  editArticle: (
    articleId: string,
    newContent: string,
    newScope: string,
    newHashtags: string[]
  ) => void;
}

type NewFeedNavigationProp = StackNavigationProp<NewFeedParamList>;

const { width } = Dimensions.get("window");

const Post: React.FC<PostProps> = ({
  article,
  userId,
  onCommentPress,
  onLike,
  deleteArticle,
  editArticle,
}) => {
  const navigation = useNavigation<NewFeedNavigationProp>();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role from AsyncStorage
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem("role");
        setUserRole(role);
      } catch (error) {
        console.error("Lỗi khi lấy userRole:", error);
      }
    };
    fetchUserRole();
  }, []);

  const isAdmin = userRole === "admin";

  const {
    handleOptions,
    isEditModalVisible,
    isReportModalVisible,
    editContent,
    editScope,
    editHashtags,
    setEditContent,
    setEditScope,
    setEditHashtags,
    saveEdit,
    setEditModalVisible,
    setReportModalVisible,
    selectedReportReason,
    setSelectedReportReason,
    submitReport,
    saveArticleToCollection,
    isSaved,
  } = usePostActions(deleteArticle, editArticle, article, userId);

  const isSharedPost = !!article.sharedPostId;
  const isLiked = article.emoticons?.some((id) => id.toString() === userId) ?? false;

  const handlePress = () => {
    navigation.navigate("ArticleDetail", { articleId: article._id });
  };

  const handleAvatarPress = () => {
    if (article.createdBy._id === userId) {
      navigation.navigate("MyProfile", { screen: "MyProfile", params: { userId: userId! } });
    } else {
      navigation.navigate("Profile", { userId: article.createdBy._id });
    }
  };

  // New function to handle group name press
  const handleGroupPress = () => {
    if (article.groupID?._id) {
      navigation.navigate("GroupDetailsScreen", {
        groupId: article.groupID._id,
        currentUserId: userId,
      });
    }
  };

  // Hàm xử lý khi bấm vào hashtag
  const handleHashtagPress = (tag: string) => {
    // Chỉ truyền thẳng tag (bao gồm cả dấu #) vào params
    navigation.navigate("SearchNavigation", {
      screen: "SearchPost",
      params: { textSearch: [tag] }, // Truyền trực tiếp tag, bao gồm dấu #
    });
  };

  const renderImage = (photos: Article["listPhoto"]) => {
    if (!photos || photos.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);

    // Check if the item is a video based on the 'type' field
    const isVideo = (item: { type: string }) => {
      return item.type.toLowerCase() === "video";
    };

    return (
      <View style={styles.imageContainer}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          onScroll={(event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(contentOffsetX / width);
            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            isVideo(item) ? (
              <Video
                source={{ uri: item.url }}
                style={styles.postImage}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                isMuted={false}
                shouldPlay={currentIndex === photos.findIndex((p) => p._id === item._id)}
                onError={(error) => console.log("Video error:", error)}
              />
            ) : (
              <Image
                source={{ uri: item.url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )
          )}
        />
        {photos.length > 1 && (
          <View style={styles.imageIndex}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {currentIndex + 1}/{photos.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "Công khai":
        return <Ionicons name="earth-outline" size={14} color={Color.textColor3} />;
      case "Bạn bè":
        return <Ionicons name="people-outline" size={14} color={Color.textColor3} />;
      case "Riêng tư":
        return (
          <Ionicons name="lock-closed-outline" size={14} color={Color.textColor3} />
        );
      default:
        return null;
    }
  };

  const normalizedScope = article.scope || "Công khai";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleAvatarPress}>
            <Image
              source={{
                uri:
                  article.createdBy.avt.length > 0
                    ? article.createdBy.avt[article.createdBy.avt.length - 1].url
                    : "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.userAndGroup}>
              <Text
                style={[styles.username, { color: Color.textColor1 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {article.createdBy.displayName}
              </Text>
              {article.groupID && (
                <>
                  <Text style={[styles.groupSeparator, { color: Color.textColor3 }]}>
                    •
                  </Text>
                  <TouchableOpacity onPress={handleGroupPress}>
                    <Text
                      style={[styles.groupName, { color: Color.mainColor2 }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {article.groupID.groupName}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            {article.address && (
              <Text
                style={[styles.location, { color: Color.textColor3 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {article.address.ward}, {article.address.district}, {article.address.province}
              </Text>
            )}
            <View style={styles.scopeContainer}>
              {getScopeIcon(normalizedScope)}
              <Text style={[styles.scopeText, { color: Color.textColor3 }]}>
                {normalizedScope}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => !isAdmin && handleOptions()}
          disabled={isAdmin}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={isAdmin ? Color.textColor3 : Color.textColor1}
          />
        </TouchableOpacity>
      </View>

      {!isSharedPost && renderImage(article.listPhoto)}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            onPress={() => !isAdmin && onLike()}
            disabled={isAdmin}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={28}
              color={isAdmin ? Color.textColor3 : isLiked ? "red" : Color.textColor1}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => !isAdmin && onCommentPress(article)}
            disabled={isAdmin}
          >
            <Ionicons
              name="chatbubble-outline"
              size={28}
              color={isAdmin ? Color.textColor3 : Color.textColor1}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => !isAdmin && handlePress()}
            disabled={isAdmin}
          >
            <Ionicons
              name="paper-plane-outline"
              size={28}
              color={isAdmin ? Color.textColor3 : Color.textColor1}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => !isAdmin && saveArticleToCollection(article._id)}
          disabled={isAdmin}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={28}
            color={isAdmin ? Color.textColor3 : isSaved ? Color.mainColor2 : Color.textColor1}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.likes, { color: Color.textColor1 }]}>
          {article.emoticons?.length || 0} lượt thích
        </Text>
        <Text style={[styles.description, { color: Color.textColor1 }]}>
          {article.content}
        </Text>
        {article.hashTag && article.hashTag.length > 0 && (
          <View style={styles.hashtagContainer}>
            {article.hashTag.map((tag, index) => (
              <TouchableOpacity
                key={`${tag}-${index}`}
                onPress={() => handleHashtagPress(tag)} // Gọi hàm mới khi bấm
              >
                <Text
                  style={[styles.hashtag, { color: Color.mainColor2 }]}
                >
                  {tag} {/* Hiển thị tag nguyên bản từ backend */}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={[styles.timestamp, { color: Color.textColor3 }]}>
          {new Date(article.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      <EditModal
        visible={isEditModalVisible && !isAdmin}
        editContent={editContent}
        editScope={editScope}
        editHashtags={editHashtags}
        setEditContent={setEditContent}
        setEditScope={setEditScope}
        setEditHashtags={setEditHashtags}
        onSave={saveEdit}
        onCancel={() => setEditModalVisible(false)}
        isLoading={false}
      />
      <ReportModal
        isVisible={isReportModalVisible && !isAdmin}
        onClose={() => setReportModalVisible(false)}
        selectedReason={selectedReportReason}
        setSelectedReason={setSelectedReportReason}
        onSubmit={submitReport}
      />
    </View>
  );
};

export default Post;

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 30,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userAndGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
  },
  groupSeparator: {
    fontSize: 14,
    marginHorizontal: 5,
  },
  groupName: {
    fontSize: 14,
    fontWeight: "400",
    maxWidth: width * 0.35,
  },
  location: {
    fontSize: 12,
    maxWidth: width - 120,
  },
  scopeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  scopeText: {
    fontSize: 12,
    marginLeft: 5,
  },
  menuButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  actionsLeft: {
    flexDirection: "row",
    gap: 20,
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  likes: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 400,
  },
  postImage: {
    width: width,
    height: 400,
  },
  imageIndex: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 2,
  },
  hashtag: {
    fontSize: 13,
    fontWeight: "bold",
    marginRight: 6,
  },
});
import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Article } from "@/src/features/newfeeds/interface/article";
import { usePostActions } from "@/src/features/newfeeds/components/post/usePost";
import EditModal from "@/src/features/newfeeds/components/EditModal/EditModal";
import ReportModal from "@/src/features/newfeeds/components/ReportModal/ReportModal";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { NewFeedParamList } from "@/src/shared/routes/NewFeedNavigation";
import { StackNavigationProp } from "@react-navigation/stack";

const colors = getColor();

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

  const renderImage = (photos: Article["listPhoto"]) => {
    if (!photos || photos.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);

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
            <Image
              source={{ uri: item.url }}
              style={styles.postImage}
              resizeMode="cover"
            />
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
        return <Ionicons name="earth-outline" size={14} color={colors.textColor3} />;
      case "Bạn bè":
        return <Ionicons name="people-outline" size={14} color={colors.textColor3} />;
      case "Riêng tư":
        return (
          <Ionicons name="lock-closed-outline" size={14} color={colors.textColor3} />
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
          <View>
            <View style={styles.userAndGroup}>
              <Text style={[styles.username, { color: colors.textColor1 }]}>
                {article.createdBy.displayName}
              </Text>
              {article.groupID && (
                <Text style={[styles.groupName, { color: colors.mainColor2 }]}>
                  • {article.groupID.groupName}
                </Text>
              )}
            </View>
            {article.address && (
              <Text
                style={[styles.location, { color: colors.textColor3 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {article.address.placeName}, {article.address.province}
              </Text>
            )}
            <View style={styles.scopeContainer}>
              {getScopeIcon(normalizedScope)}
              <Text style={[styles.scopeText, { color: colors.textColor3 }]}>
                {normalizedScope}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => handleOptions()}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textColor1} />
        </TouchableOpacity>
      </View>

      {!isSharedPost && renderImage(article.listPhoto)}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={onLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={28}
              color={isLiked ? "red" : colors.textColor1}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onCommentPress(article)}>
            <Ionicons
              name="chatbubble-outline"
              size={28}
              color={colors.textColor1}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePress} >
            <Ionicons name="paper-plane-outline" size={28} color={colors.textColor1} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => saveArticleToCollection(article._id)}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={28}
            color={isSaved ? colors.mainColor2 : colors.textColor1}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.likes, { color: colors.textColor1 }]}>
          {article.emoticons?.length || 0} lượt thích
        </Text>
        <Text style={[styles.description, { color: colors.textColor1 }]}>
          {article.content}
        </Text>
        {article.hashTag && article.hashTag.length > 0 && (
          <View style={styles.hashtagContainer}>
            {article.hashTag.map((tag, index) => (
              <Text
                key={index}
                style={[styles.hashtag, { color: colors.mainColor2 }]}
              >
                {tag}
              </Text>
            ))}
          </View>
        )}
        <Text style={[styles.timestamp, { color: colors.textColor3 }]}>
          {new Date(article.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>

      <EditModal
        visible={isEditModalVisible}
        editContent={editContent}
        editScope={editScope}
        editHashtags={editHashtags}
        setEditContent={setEditContent}
        setEditScope={setEditScope}
        setEditHashtags={setEditHashtags}
        onSave={saveEdit}
        onCancel={() => setEditModalVisible(false)}
      />

      <ReportModal
        isVisible={isReportModalVisible}
        onClose={() => setReportModalVisible(false)}
        selectedReason={selectedReportReason}
        setSelectedReason={setSelectedReportReason}
        onSubmit={submitReport}
      />
    </View>
  );
};

export default Post;

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
  userAndGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
  },
  groupName: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: "400",
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
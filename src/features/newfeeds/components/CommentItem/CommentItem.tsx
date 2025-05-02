import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "@/src/features/newfeeds/interface/article";
import { useCommentVisibility } from "./useCommentVisibility";
import { useReplyInput } from "./useReplyInput";
import timeAgo from "@/src/shared/utils/TimeAgo";
import getColor from "@/src/styles/Color";
import * as ImagePicker from "expo-image-picker";

const colors = getColor();
const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface CommentItemProps {
  userId: string;
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (parentCommentId: string, content: string, media?: ImagePicker.ImagePickerAsset[]) => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  userId,
  comment,
  onLike,
  onReply,
  level = 1,
}) => {
  const { areRepliesVisible, toggleReplies } = useCommentVisibility();
  const {
    isReplyInputVisible,
    replyContent,
    showReplyInput,
    hideReplyInput,
    handleReplyChange,
    resetReplyContent,
  } = useReplyInput();

  const [selectedMedia, setSelectedMedia] = React.useState<ImagePicker.ImagePickerAsset[]>([]);
  const [imageLoading, setImageLoading] = React.useState<{ [key: string]: boolean }>({});
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const isLiked = comment.emoticons?.some((id) => id.toString() === userId) ?? false;
  const avatarUrl = comment._iduser?.avt?.slice(-1)[0]?.url ?? DEFAULT_AVATAR;
  const replies = comment.replyComment || [];
  const mediaList = comment.img || [];

  const getMarginLeft = (currentLevel: number) => Math.min((currentLevel - 1) * 20, 40);

  const toggleReplyInput = () => {
    isReplyInputVisible ? (hideReplyInput(), setSelectedMedia([])) : showReplyInput();
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (!result.canceled) setSelectedMedia(result.assets);
  };

  const handleSubmitReply = () => {
    if (replyContent.trim() || selectedMedia.length) {
      onReply(comment._id, replyContent, selectedMedia);
      resetReplyContent();
      setSelectedMedia([]);
      hideReplyInput();
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderMediaItem = ({ item }: { item: { _id: string; url: string } }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => openImageModal(item.url || DEFAULT_AVATAR)}
    >
      {imageLoading[item._id] && (
        <ActivityIndicator style={styles.loading} size="small" color={colors.mainColor1} />
      )}
      <Image
        source={{ uri: item.url || DEFAULT_AVATAR }}
        style={styles.mediaImage}
        onLoadStart={() => setImageLoading((prev) => ({ ...prev, [item._id]: true }))}
        onLoadEnd={() => setImageLoading((prev) => ({ ...prev, [item._id]: false }))}
        onError={(e) => console.log(`Error loading ${item._id}:`, e.nativeEvent.error)}
      />
    </TouchableOpacity>
  );

  const renderMediaPreview = ({ item }: { item: ImagePicker.ImagePickerAsset }) => (
    <Image
      source={{ uri: item.uri || DEFAULT_AVATAR }}
      style={styles.mediaPreview}
      onError={(e) => console.log("Preview error:", e.nativeEvent.error)}
    />
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { marginLeft: getMarginLeft(level) }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.commentRow}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={[styles.username, { color: colors.textColor1 }]}>
            {comment._iduser?.displayName || "Unknown"}
          </Text>
          <Text style={[styles.text, { color: colors.textColor1 }]}>{comment.content}</Text>

          {mediaList.length > 0 && (
            <FlatList
              data={mediaList}
              renderItem={renderMediaItem}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          )}

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onLike(comment._id)} style={styles.actionButton}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={14}
                color={isLiked ? "red" : colors.textColor3}
              />
              <Text style={[styles.count, { color: isLiked ? "red" : colors.textColor3 }]}>
                {comment.emoticons?.length || 0}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.separator, { color: colors.textColor3 }]}>·</Text>
            <TouchableOpacity onPress={toggleReplyInput}>
              <Text style={[styles.actionText, { color: colors.mainColor1 }]}>Phản hồi</Text>
            </TouchableOpacity>
            <Text style={[styles.separator, { color: colors.textColor3 }]}>·</Text>
            <Text style={[styles.time, { color: colors.textColor3 }]}>{timeAgo(comment.createdAt)}</Text>
          </View>
        </View>
      </View>

      {isReplyInputVisible && (
        <View style={styles.replySection}>
          {selectedMedia.length > 0 && (
            <FlatList
              data={selectedMedia}
              renderItem={renderMediaPreview}
              keyExtractor={(_, index) => `${index}`}
              horizontal
              style={styles.previewContainer}
            />
          )}
          <View style={styles.replyInputContainer}>
            <TouchableOpacity onPress={pickMedia}>
              <Ionicons name="image" size={24} color={colors.mainColor1} />
            </TouchableOpacity>
            <TextInput
              style={[styles.replyInput, { color: colors.textColor1 }]}
              placeholder="Viết phản hồi..."
              placeholderTextColor={colors.textColor3}
              value={replyContent}
              onChangeText={handleReplyChange}
              multiline
            />
            <TouchableOpacity onPress={handleSubmitReply}>
              <Ionicons name="send" size={20} color={colors.mainColor1} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {replies.length > 0 && (
        <TouchableOpacity onPress={toggleReplies}>
          <Text style={[styles.toggleReplies, { color: colors.mainColor1 }]}>
            {areRepliesVisible ? "Ẩn bớt" : `Xem tất cả ${replies.length} phản hồi`}
          </Text>
        </TouchableOpacity>
      )}

      {areRepliesVisible && replies.map((reply) => (
        <CommentItem
          key={reply._id}
          userId={userId}
          comment={reply}
          onLike={onLike}
          onReply={onReply}
          level={level + 1}
        />
      ))}

      {/* Modal for Enlarged Image */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeImageModal}>
          <Image
            source={{ uri: selectedImage || DEFAULT_AVATAR }}
            style={styles.enlargedImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: colors.backGround },
  commentRow: { flexDirection: "row", alignItems: "flex-start" },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 12, backgroundColor: colors.backGround },
  content: { flex: 1 ,},
  username: { fontWeight: "bold", fontSize: 15 },
  text: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  actionButton: { flexDirection: "row", alignItems: "center" },
  count: { marginLeft: 6, fontSize: 12 },
  separator: { fontSize: 12, marginHorizontal: 6 },
  actionText: { fontSize: 12, fontWeight: "600" },
  time: { fontSize: 12 },
  replySection: { marginLeft: 40 },
  previewContainer: { maxHeight: 100, marginVertical: 10 },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backGround,
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderColor1,
  },
  replyInput: { flex: 1, fontSize: 14, paddingHorizontal: 10, maxHeight: 100 },
  toggleReplies: { fontSize: 14, marginVertical: 6, marginLeft: 50, fontWeight: "600" },
  mediaGrid: { marginTop: 8 },
  mediaItem: { width: "48%", margin: "1%", aspectRatio: 1, position: "relative" },
  mediaImage: { width: "100%", height: "100%", borderRadius: 5, backgroundColor: colors.backGround },
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center" },
  mediaPreview: { width: 80, height: 80, marginRight: 10, borderRadius: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  enlargedImage: {
    width: "90%",
    height: "80%",
  },
});

export default CommentItem;
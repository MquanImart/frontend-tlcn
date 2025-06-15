import { Comment } from "@/src/features/newfeeds/interface/article";
import timeAgo from "@/src/shared/utils/TimeAgo";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCommentVisibility } from "./useCommentVisibility";
import { useReplyInput } from "./useReplyInput";

const DEFAULT_AVATAR = "https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png";

interface CommentItemProps {
  userId: string;
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (parentCommentId: string, content: string, media?: ImagePicker.ImagePickerAsset[]) => void;
  level?: number;
  isHighlighted?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  userId,
  comment,
  onLike,
  onReply,
  level = 1,
  isHighlighted = false,
}) => {
  useTheme();
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

  const getIndentation = (currentLevel: number) => {
    const maxIndentationPx = 40;
    const indentationPerLevel = 20; 
    const calculatedLevel = Math.min(currentLevel, 3);
    return (calculatedLevel - 1) * indentationPerLevel;
  };
  const currentIndentation = getIndentation(level);


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
        <ActivityIndicator style={styles.loading} size="small" color={Color.mainColor2} />
      )}
      <Image
        source={{ uri: item.url || DEFAULT_AVATAR }}
        style={styles.mediaImage}
        onLoadStart={() => setImageLoading((prev) => ({ ...prev, [item._id]: true }))}
        onLoadEnd={() => setImageLoading((prev) => ({ ...prev, [item._id]: false }))}
        onError={(e) => console.log(`Error loading ${item._id}:`, e)}
      />
    </TouchableOpacity>
  );

  const renderMediaPreview = ({ item }: { item: ImagePicker.ImagePickerAsset }) => (
    <Image
      source={{ uri: item.uri || DEFAULT_AVATAR }}
      style={styles.mediaPreview}
      onError={(e) => console.log("Preview error:", e)}
    />
  );

  return (
    <View style={[styles.container, isHighlighted && { backgroundColor: Color.backgroundSelected }]}>
      <View style={[styles.commentRow, { marginLeft: currentIndentation }]}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={[styles.username, { color: Color.textPrimary }]}>
            {comment._iduser?.displayName || "Unknown"}
          </Text>
          <Text style={[styles.text, { color: Color.textPrimary }]}>{comment.content}</Text>

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
                color={isLiked ? Color.error : Color.textSecondary}
              />
              <Text style={[styles.count, { color: isLiked ? Color.error : Color.textSecondary }]}>
                {comment.emoticons?.length || 0}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.separator, { color: Color.textSecondary }]}>·</Text>
            <TouchableOpacity onPress={toggleReplyInput}>
              <Text style={[styles.actionText, { color: Color.textSecondary }]}>Phản hồi</Text>
            </TouchableOpacity>
            <Text style={[styles.separator, { color: Color.textSecondary }]}>·</Text>
            <Text style={[styles.time, { color: Color.textSecondary }]}>{timeAgo(comment.createdAt)}</Text>
          </View>
        </View>
      </View>

      {isReplyInputVisible && (
        <View style={[styles.replySection, { marginLeft: styles.avatar.width + styles.avatar.marginRight }]}>
          {selectedMedia.length > 0 && (
            <FlatList
              data={selectedMedia}
              renderItem={renderMediaPreview}
              keyExtractor={(_, index) => `${index}`}
              horizontal
              style={styles.previewContainer}
            />
          )}
          <View style={[styles.replyInputContainer, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]}>
            <TouchableOpacity onPress={pickMedia}>
              <Ionicons name="image" size={24} color={Color.mainColor2} />
            </TouchableOpacity>
            <TextInput
              style={[styles.replyInput, { color: Color.textPrimary }]}
              placeholder="Viết phản hồi..."
              placeholderTextColor={Color.textTertiary}
              value={replyContent}
              onChangeText={handleReplyChange}
              multiline
            />
            <TouchableOpacity onPress={handleSubmitReply}>
              <Ionicons name="send" size={20} color={Color.mainColor2} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {replies.length > 0 && (
        <TouchableOpacity
          onPress={toggleReplies}
          style={[styles.toggleRepliesContainer, { marginLeft: styles.avatar.width + styles.avatar.marginRight }]}
        >
          <Text style={[styles.toggleReplies, { color: Color.textSecondary }]}>
            {areRepliesVisible ? "Ẩn bớt" : `Xem tất cả ${replies.length} phản hồi`}
          </Text>
        </TouchableOpacity>
      )}

      {areRepliesVisible &&
        replies.map((reply) => (
          <CommentItem
            key={reply._id}
            userId={userId}
            comment={reply}
            onLike={onLike}
            onReply={onReply}
            level={level + 1}
            isHighlighted={reply._id === comment._id}
          />
        ))}

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingRight: 12
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 12,
  },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 12, backgroundColor: Color.backgroundTertiary },
  content: { flex: 1 },
  username: { fontWeight: "bold", fontSize: 15 },
  text: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  actions: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  actionButton: { flexDirection: "row", alignItems: "center" },
  count: { marginLeft: 6, fontSize: 12 },
  separator: { fontSize: 12, marginHorizontal: 6 },
  actionText: { fontSize: 12, fontWeight: "600" },
  time: { fontSize: 12 },
  replySection: {
    marginLeft: 38 + 12, 
    marginTop: 10,
  },
  previewContainer: { maxHeight: 100, marginVertical: 10 },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
  },
  replyInput: { flex: 1, fontSize: 14, paddingHorizontal: 10, maxHeight: 100 },
  toggleRepliesContainer: {
    marginLeft: 38 + 12, 
    marginVertical: 6,
  },
  toggleReplies: { fontSize: 14, fontWeight: "600" },
  mediaGrid: { marginTop: 8 },
  mediaItem: { width: "48%", margin: "1%", aspectRatio: 1, position: "relative" },
  mediaImage: { width: "100%", height: "100%", borderRadius: 5, backgroundColor: Color.backgroundTertiary },
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
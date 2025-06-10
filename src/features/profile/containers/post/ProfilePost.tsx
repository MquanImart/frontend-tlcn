import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Post from "@/src/features/newfeeds/components/post/Post";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import { Ionicons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import useProfilePost from "./useProfilePost";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Nhận userId như một prop
interface ProfilePostProps {
  userId: string;
}

export default function ProfilePost({ userId }: ProfilePostProps) {
  useTheme()
  const {
    articles,
    isModalVisible,
    currentArticle,
    newReply,
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    setNewReply,
    likeArticle,
    calculateTotalComments,
    handleAddComment,
    deleteArticle,
    editArticle,
  } = useProfilePost(userId); // Truyền userId vào hook

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {articles.map((item) => (
          <Post
            key={item._id}
            article={item}
            userId={userId} // Truyền userId vào component Post
            onCommentPress={() => openComments(item)}
            onLike={() => likeArticle(item._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        ))}
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        swipeDirection="down"
        onSwipeComplete={closeComments}
      >
        <View style={[styles.commentContainer, { backgroundColor: Color.background }]}>
          <View style={[styles.commentHeader, { borderBottomColor: Color.border }]}>
            <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={Color.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentList}
          >
            {currentArticle?.comments?.map((item) => (
              <CommentItem
                userId={userId} // Truyền userId vào component CommentItem
                key={item._id}
                comment={item}
                onLike={likeComment}
                onReply={replyToComment}
              />
            ))}
          </ScrollView>

          <View style={[styles.commentInputContainer, { borderTopColor: Color.border }]}>
            <TextInput
              style={[styles.commentInput, { 
                borderColor: Color.border, 
                backgroundColor: Color.backgroundTertiary, 
                color: Color.textPrimary 
              }]}
              placeholder="Viết bình luận..."
              placeholderTextColor={Color.textTertiary}
              value={newReply}
              onChangeText={setNewReply}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={20} color={Color.mainColor1} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
  },
  commentList: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
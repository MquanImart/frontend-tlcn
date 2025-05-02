import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getColor from "@/src/styles/Color";
import UserInfo from "@/src/features/group/components/UserInfo";
import { Article } from "@/src/features/newfeeds/interface/article";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import Post from "@/src/features/newfeeds/components/post/Post";
import Modal from "react-native-modal";
import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import InviteAdminModal from "@/src/features/group/components/InviteAdminModal";
import restClient from "@/src/shared/services/RestClient";
import { useGroupMySelf } from "./useGroupMySelf";

const colors = getColor();
const groupsClient = restClient.apiClient.service("apis/groups");

interface GroupMySelfProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner";
  onRoleUpdated: () => void; 
}

interface InviteAdminModalProps {
  groupName: string;
  inviterName: string;
  inviteDate: string;
  inviterAvatar: string;
  hasInvite: boolean;
}

const GroupMySelf: React.FC<GroupMySelfProps> = ({ groupId, currentUserId, role, onRoleUpdated }) => {

  const {
    articles,
    setArticles,
    loading,
    modalVisible,
    setModalVisible,
    adminInvite,
    handleAcceptInvite,
    handleRejectInvite,
  } = useGroupMySelf(groupId, currentUserId); 
  
  const {
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
  } = useNewFeed(articles, setArticles);



  const handleAcceptInviteWithRoleUpdate = async () => {
    await handleAcceptInvite();
    onRoleUpdated();
  };

  const handleRejectInviteWithRoleUpdate = async () => {
    await handleRejectInvite(); 
    onRoleUpdated();
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Thông tin</Text>  

      {/* Hiển thị thông tin người dùng */}
      {adminInvite ? (
        <UserInfo
        groupName={adminInvite?.groupName || ""}
        role={role}
        joinDate={Date.now()}
        inviterAvatar={adminInvite?.inviterAvatar || ""}
        onPress={() => adminInvite.hasInvite ? setModalVisible(true) : setModalVisible(false) } // Bấm vào mở modal
      />
      

      ) : (
        <Text style={styles.noInviteText}>Không có lời mời làm quản trị viên</Text>
      )}

      {/* Hiển thị modal lời mời làm quản trị viên nếu có */}
      {adminInvite && modalVisible && (
        <InviteAdminModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onAccept={handleAcceptInviteWithRoleUpdate}
          onReject={handleRejectInviteWithRoleUpdate}
          groupName={adminInvite.groupName}
          inviterName={adminInvite.inviterName}
          inviteDate={new Date(adminInvite.inviteDate).toLocaleDateString("vi-VN")}
          inviterAvatar={adminInvite.inviterAvatar}
        />
      )}

      <Text style={styles.infoText}>Bài viết trong nhóm</Text>
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Post
            article={item}
            userId = {currentUserId}
            onCommentPress={() => openComments(item)}
            onLike={() => likeArticle(item._id, item.createdBy._id)}
            deleteArticle={deleteArticle}
            editArticle={editArticle}
          />
        )}
        scrollEventThrottle={16}
      />

      {/* Modal bình luận */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        swipeDirection="down"
        onSwipeComplete={closeComments}
      >
        <View style={[styles.commentContainer, { backgroundColor: colors.backGround }]}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentTitle, { color: colors.textColor1 }]}>
              {calculateTotalComments(currentArticle?.comments || [])} bình luận
            </Text>
            <TouchableOpacity onPress={closeComments}>
              <Ionicons name="close" size={24} color={colors.textColor1} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currentArticle?.comments || []}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommentItem
                userId = {currentUserId}
                comment={item}
                onLike={likeComment}
                onReply={replyToComment}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.commentList}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Viết bình luận..."
              placeholderTextColor={colors.textColor3}
              value={newReply}
              onChangeText={setNewReply}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={20} color={colors.mainColor1} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupMySelf;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.backGround,
  },
  infoText: {
    fontSize: 18,
    color: colors.textColor1,
    marginBottom: 10,
    fontWeight: "bold",
  },
  noInviteText: {
    fontSize: 16,
    color: colors.textColor3,
    textAlign: "center",
    marginVertical: 10,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: 400,
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
    borderBottomColor: colors.borderColor1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderColor1,
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

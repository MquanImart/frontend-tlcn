import useCollectionPost from "@/src/features/collections/containers/post/useCollectionPost";
import { Article } from "@/src/features/newfeeds/interface/article";
import { Collection, CollectionItem } from "@/src/interface/interface_reference/collection";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActionSheetIOS, Alert } from "react-native";

const reportsClient = restClient.apiClient.service("apis/reports");
const usersClient = restClient.apiClient.service("apis/users");
const notificationsClient = restClient.apiClient.service("apis/notifications");

export const usePostActions = (
  deleteArticle: (articleId: string) => void,
  editArticle: (articleId: string, newContent: string, newScope: string, newHashtags: string[]) => void,
  article: Article,
  userId: string
) => {
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [editContent, setEditContent] = useState<string>("");
  const [editScope, setEditScope] = useState<string>("Công khai");
  const [editHashtags, setEditHashtags] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<string>("");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const { createCollection } = useCollectionPost();
  const isOwnPost = article.createdBy._id === userId;

  const getUserDisplayName = async () => {
    const name = await AsyncStorage.getItem("displayName");
    setDisplayName(name);
  };

  useEffect(() => {
    getUserDisplayName();
  }, []);

  const openEditModal = (currentContent: string, currentScope: string, currentHashtags: string[]) => {
    const normalizedScope = ["Công khai", "Bạn bè", "Riêng tư"].includes(currentScope)
      ? currentScope
      : "Công khai";
    setEditContent(currentContent || "");
    setEditScope(normalizedScope);
    setEditHashtags(currentHashtags || []);
    setEditModalVisible(true);
    console.log("Opening EditModal with scope:", normalizedScope);
  };

  useEffect(() => {
    const checkIfArticleIsSaved = async () => {
      try {
        const userCollections = await usersClient.get(`${userId}/collections`);
        if (userCollections.success) {
          const defaultCollection = userCollections.data.find(
            (item: any) => item.collection.name === "Tất cả bài viết đã lưu"
          );
          if (defaultCollection) {
            const isArticleSaved = defaultCollection.collection.items.some(
              (item: CollectionItem) => item._id === article._id
            );
            setIsSaved(isArticleSaved);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái lưu bài viết:", error);
      }
    };
    checkIfArticleIsSaved();
  }, [article._id]);

  const handleOptions = () => {
    if (isOwnPost) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Xóa bài viết", "Chỉnh sửa"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              Alert.alert(
                "Xác nhận xóa",
                "Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.",
                [
                  {
                    text: "Hủy",
                    style: "cancel",
                  },
                  {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => deleteArticle(article._id),
                  },
                ]
              );
              break;
            case 2:
              openEditModal(article.content, article.scope, article.hashTag || []);
              break;
            default:
              break;
          }
        }
      );
    } else {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Báo cáo"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              setReportModalVisible(true);
              break;
            default:
              break;
          }
        }
      );
    }
  };

  const saveEdit = () => {
    if (editContent.trim() && editScope.trim()) {
      editArticle(article._id, editContent, editScope, editHashtags);
      setEditModalVisible(false);
    } else {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung và phạm vi bài viết.");
    }
  };

  const submitReport = async () => {
    if (!selectedReportReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn lý do báo cáo.");
      return;
    }
    try {
      const response = await reportsClient.create({
        _idReporter: userId,
        reason: selectedReportReason,
        articleId: article._id,
        status: "pending",
      });

      if (response.success) {
        if (userId !== article.createdBy._id) {
          try {
            await notificationsClient.create({
              senderId: userId,
              receiverId: article.createdBy._id,
              message: `đã báo cáo bài viết của bạn với lý do: ${selectedReportReason}`,
              status: "unread",
              articleId: article._id,
              relatedEntityType: "Article",
            });
          } catch (notificationError) {
            console.error("🔴 Lỗi khi gửi thông báo báo cáo:", notificationError);
          }
        }

        Alert.alert("Thành công", "Báo cáo đã được gửi.");
      } else {
        Alert.alert("Lỗi", "Không thể gửi báo cáo.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi báo cáo.");
    }

    setReportModalVisible(false);
    setSelectedReportReason("");
  };

  const saveArticleToCollection = async (articleId: string) => {
    try {
      const userCollections = await usersClient.get(`${userId}/collections`);
      let defaultCollection: { collection: Collection; imgDefault: string } | undefined =
        userCollections.data.find((item: any) => item.collection.name === "Tất cả bài viết đã lưu");

      if (!defaultCollection) {
        const newCollectionResponse = await createCollection("Tất cả bài viết đã lưu");
        defaultCollection = {
          collection: newCollectionResponse,
          imgDefault: "https://storage.googleapis.com/kltn-hcmute/public/default/default_article.png",
        };
      }

      const isArticleAlreadyInCollection = defaultCollection.collection.items.some(
        (item: CollectionItem) => item._id === articleId
      );

      if (isArticleAlreadyInCollection) {
        Alert.alert("Cảnh báo", "Bài viết đã có trong bộ sưu tập.");
        return;
      }

      const collectionAPI = restClient.apiClient.service(
        `apis/collections/${defaultCollection.collection._id}/article/${articleId}`
      );
      const result = await collectionAPI.create({});

      if (!result.success) {
        throw new Error(result.message || "Không thể thêm bài viết vào bộ sưu tập.");
      }

      setIsSaved(true);
      Alert.alert("Thành công", "Bài viết đã được lưu vào bộ sưu tập.");
    } catch (error: any) {
      console.error("Lỗi khi lưu bài viết:", error);
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi lưu bài viết.");
    }
  };

  return {
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
  };
};
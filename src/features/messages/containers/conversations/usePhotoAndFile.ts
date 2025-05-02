import { Message } from "@/src/interface/interface_flex";
import restClient from "@/src/shared/services/RestClient";
import { useState } from "react";

const IMAGE_LIMIT = 12;
const VIDEO_LIMIT = 10;

const usePhotoAndFile = (conversationId: string) => {

    const [messageImages, setMessageImages] = useState<Message[] | null>(null);
    const [messageVideos, setMessageVideos] = useState<Message[] | null>(null);

    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn tin nhắn không

    const [loadingMoreVideo, setLoadingMoreVideo] = useState(false);
    const [hasMoreVideo, setHasMoreVideo] = useState(true); // Kiểm tra còn tin nhắn không

    const getAllMessageImages = async () => {
        if (conversationId){
            const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversationId}/photo`);
            const result = await conversationAPI.find({type: "img", limit: IMAGE_LIMIT, skip: 0});
            if (result.success){
                setMessageImages(result.data);
            }
        }
    }

    const getAllMessageVideos = async () => {
        if (conversationId){
            const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversationId}/photo`);
            const result = await conversationAPI.find({type: "video", limit: VIDEO_LIMIT, skip: 0});
            if (result.success){
                setMessageVideos(result.data);
            }
        }
    }

    const loadMoreMessagesImage = async () => {
        if (messageImages){
            if (loadingMore || !hasMore) return;
            setLoadingMore(true);
            try {
                const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversationId}/photo`);
                const result = await conversationAPI.find({type: "img", imit: IMAGE_LIMIT, skip: messageImages.length});
                if (result.success){
                    setMessageImages((prev) => {
                        const newMessages = result.data.filter(
                          (newMsg: Message) => !prev?.some((msg) => msg._id === newMsg._id)
                        );
                        return prev ? [...prev, ...newMessages] : newMessages;
                      });
                      
                    setHasMore(result.data.length === IMAGE_LIMIT);
                }
            } catch (error) {
              console.error("Lỗi tải thêm tin nhắn", error);
            } finally {
              setLoadingMore(false);
            }
        }
    };

    const loadMoreMessagesVideo = async () => {
        if (messageImages){
            if (loadingMoreVideo || !hasMoreVideo) return;
            setLoadingMoreVideo(true);
            try {
                const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversationId}/photo`);
                const result = await conversationAPI.find({ type: "video", limit: IMAGE_LIMIT, skip: messageImages.length});
                if (result.success){
                    setMessageImages((prev) => {
                        const newMessages = result.data.filter(
                          (newMsg: Message) => !prev?.some((msg) => msg._id === newMsg._id)
                        );
                        return prev ? [...prev, ...newMessages] : newMessages;
                      });
                      
                    setHasMoreVideo(result.data.length === IMAGE_LIMIT);
                }
            } catch (error) {
              console.error("Lỗi tải thêm tin nhắn", error);
            } finally {
              setLoadingMore(false);
            }
        }
    };
    return {
        messageImages,
        messageVideos,
        getAllMessageImages,
        getAllMessageVideos,
        loadMoreMessagesImage,
        loadMoreMessagesVideo
    }
}

export default usePhotoAndFile;
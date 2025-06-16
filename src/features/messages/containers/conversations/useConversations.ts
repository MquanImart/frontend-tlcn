import { Conversation, Message } from "@/src/interface/interface_flex";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import useMessages from "../useMessage";
import restClient from "@/src/shared/services/RestClient";
import { Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import socket from "@/src/shared/services/socketio";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PAGE_SIZE = 20; // Số tin nhắn tải mỗi lần
type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "NewChat">;

const useConversations = (
    conversationId: string | null, 
    isFriend?: boolean,
    friend?: {
        _id: string;
        displayName: string;
    }
) => {
    const navigation = useNavigation<ChatNavigationProp>();
    const [userId, setUserId] = useState<string | null>(null);

    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn tin nhắn không
    const [text, setText] = useState<string>("");
    const [sending, setSending] = useState<boolean>(false);

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[] | null>(null);
    const messageRef = useRef<Message[] | null>(null)

    useEffect(() => {
        messageRef.current = messages
    }, [messages])

    const {
        getShortNames, 
        getOtherParticipantById
    } = useMessages();
    
    useEffect(() => {
        getUserId();
        if (!conversation && friend){
            getConversationWithFriend();
        }
    }, []);

    useEffect(() => {
        if (userId){
            getConversationWithFriend();
        }
    }, [userId]);

     useEffect(() => {
        if (conversation){
            getMessages();
        }
    }, [conversation]);

    useEffect(() => {
        if (userId){
            socket.emit("joinChat", conversationId || conversation?._id);

            socket.on("newMessage", (newMessage) => {
                if (newMessage.sender !== userId){
                    const updateMessage = messageRef.current?[newMessage, ...messageRef.current] : [newMessage]
                    setMessages(updateMessage)
                }
            });
        
            return () => {
                socket.emit("leaveChat", conversationId || conversation?._id);
                socket.off("newMessage");
            };
        }
    }, [conversationId, userId, conversation, messageRef]);

    const getUserId = async () => {
        const userId = await AsyncStorage.getItem("userId");
        setUserId(userId);
    }

    const getNameChat = () => {
        if (conversation && userId){
            if (conversation.type === "private"){
                const userData = getOtherParticipantById(conversation, userId);
                return userData?userData.displayName:"Người dùng không xác định";
            } else if (conversation.type === "group"){
                return conversation.groupName !== null? conversation.groupName : getShortNames(conversation);
            } else {
                return conversation.pageId?conversation.pageId.name : "Page không xác định";
            }
        }
        else if (friend){
            return friend.displayName
        } else {
            return "Loading..."
        }
    }
    
    const getConversation = async () => {
        if (conversationId){
            const conversationAPI = restClient.apiClient.service(`apis/conversations`);
            const result = await conversationAPI.get(conversationId);
            if (result.success){
                setConversation(result.data);
            }
                    } else if (conversation){
            const conversationAPI = restClient.apiClient.service(`apis/conversations`);
            const result = await conversationAPI.get(conversation._id);
            if (result.success){
                setConversation(result.data);
            }
        }
    }

    const getConversationWithFriend = async () => {
        if (!conversationId && friend && userId){
            const conversationAPI = restClient.apiClient.service(`apis/conversations/with-friend/${userId}`);
            const result = await conversationAPI.find({friendId: friend._id})
            if (result.success){
                setConversation(result.data);
            }
        }
    }

    const getMessages = async () => {
        if (conversationId && userId){
            const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversationId}`);
            const result = await conversationAPI.find({limit: PAGE_SIZE, skip: 0});
            if (result.success){
                setMessages(result.data);
                const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversationId}/seen-all`);
                await conversationAPI.patch("", { userId: userId});
            }
        } else if (conversation && userId){
            const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversation._id}`);
            const result = await conversationAPI.find({limit: PAGE_SIZE, skip: 0});
            if (result.success){
                setMessages(result.data);
                const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversation._id}/seen-all`);
                await conversationAPI.patch("", { userId: userId});
            } 
        }
    }

    const loadMoreMessages = async () => {
        if (messages && conversation){
            if (loadingMore || !hasMore) return;
            setLoadingMore(true);
            try {
                const conversationAPI = restClient.apiClient.service(`apis/messages/of-conversation/${conversation._id}`);
                const result = await conversationAPI.find({limit: PAGE_SIZE, skip: messages.length});
                if (result.success){
                    setMessages((prev) => {
                        const newMessages = result.data.filter(
                          (newMsg: Message) => !prev?.some((msg) => msg._id === newMsg._id)
                        );
                        return prev ? [...prev, ...newMessages] : newMessages;
                      });
                      
                    setHasMore(result.data.length === PAGE_SIZE);
                }
            } catch (error) {
              console.error("Lỗi tải thêm tin nhắn", error);
            } finally {
              setLoadingMore(false);
            }
        }
    };
    
    const openImagePicker = async () => {
        // Yêu cầu quyền truy cập thư viện ảnh
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Bạn cần cấp quyền để chọn ảnh hoặc video!');
          return null;
        }
      
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép chọn cả ảnh và video
          allowsEditing: false,
          quality: 1,
        });
      
        if (!result.canceled) {
          const asset = result.assets[0];
          const fileType = asset.type === 'video' ? 'video' : 'img';
      
          createMessage(fileType, asset)
        }

    };  
    
    const openCamera = async () => {
        // Yêu cầu quyền truy cập camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Bạn cần cấp quyền để chụp ảnh hoặc quay video!');
          return null;
        }
      
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép cả ảnh và video
          allowsEditing: true,
          quality: 1,
        });
      
        if (!result.canceled) {
          const asset = result.assets[0]; // Lấy file đầu tiên được chụp/quay
          const fileType = asset.type === 'video' ? 'video' : 'img';
      
          createMessage(fileType, asset)
        }
    };

    const handleOpenImagePicker = () => {
        Alert.alert(
          "Chọn ảnh",
          "Bạn muốn chọn ảnh từ đâu?",
          [
            { text: "Bộ sưu tập", onPress: openImagePicker },
            { text: "Camera", onPress: openCamera },
            { text: "Hủy", style: "cancel" }
          ]
        );
    };

    const sendMessage = async ( currConversationId: string, type: string, source: ImagePicker.ImagePickerAsset | null) => {
        if (type !== 'text' && !source) return;
        if (!userId) return;
        try {
            const formData = new FormData();
        
            formData.append("conversationId", currConversationId);
            formData.append("sender", userId);
            formData.append("type", type);
            if (type === "text") {
                formData.append("message", text);
            } else if (source) {
                const fileName = source.uri.split('/').pop();
                const fileType = source.type === "video" ? "video/mp4" : "image/jpeg";
                    
                const file = {
                    uri: source.uri,
                    name: fileName,
                    type: fileType,
                } as any;
        
                formData.append("file", file);
            }
        
            // Gửi FormData qua articlesClient.create
            const messageAPI = restClient.apiClient.service(`apis/messages`);
            const result = await messageAPI.create(formData);
            console.log(result);
            if (result.success) {
                if (type === 'text'){
                    setText("");
                }
                setMessages((prev) => {
                    return prev ? [result.data, ...prev] : [result.data];
                });
            } else {
              Alert.alert("Thông báo", "Không thể gửi tin nhắn!")
              }
        } catch (error) {
          Alert.alert("Đã xảy ra lỗi khi gửi tin nhắn!");
        }
    }
    const createMessage = async ( type: string, source: ImagePicker.ImagePickerAsset | null) => {
        
        if (type === 'text' && text === "") {
            return;
        }
        if (sending){
            return;
        }
        if (!userId) return;

        setSending(true);
        try{
            if (conversation){
                await sendMessage(conversation._id, type, source);
            } else {
                if (friend){
                    const conversationAPI = restClient.apiClient.service(`apis/conversations`);
                    const participants = [userId, friend._id]

                    const result = await conversationAPI.create({
                        creatorId: userId,
                        participants: participants,
                        lastMessage: {
                            sender: userId,
                            contentType: "text",
                            message: type === 'text' ? text : "Xin chào",
                          }
                    });
                    if (result.success){
                        const conversationAPI = restClient.apiClient.service(`apis/conversations`);
                        const newConversation = await conversationAPI.get(result.data._id);
                        if (newConversation.success){
                            setConversation(newConversation.data);
                        }
                        const messageAPI = restClient.apiClient.service(`apis/messages`);
                        const messages = await messageAPI.get(result.data.lastMessage);
                        if (messages.success){
                            setMessages((prev) => {
                                return prev ? [messages.data, ...prev] : [messages.data];
                            });
                        }
                        if (type === 'text'){
                            setText(""); 
                        }
                        else {
                            sendMessage(result.data._id, type, source);
                        }
                    }
                }
            }
        } finally{
            setSending(false);
        }
    }

    const navigationDetails = () => {
        if (conversation){
            navigation.navigate("Details", {defaultConversation: conversation, isFriend})
        }
    }

    return {
        navigation, text, setText,
        conversation, messages, getNameChat,
        getConversation, getMessages,
        loadMoreMessages, loadingMore,
        userId, handleOpenImagePicker,
        createMessage, navigationDetails,
        sending
    }
}

export default useConversations;
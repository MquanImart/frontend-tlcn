import { Conversation, UserDisplay } from "@/src/interface/interface_flex";
import { MessagesDrawerParamList, StrangeChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import restClient from "@/src/shared/services/RestClient";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { Keyboard, TextInput } from "react-native";
import { SearchConversations } from "../list-messages/useListMessages";
import useMessages from "../useMessage";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";
import { StackNavigationProp } from "@react-navigation/stack";
import socket from "@/src/shared/services/socketio";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MessagesNavigationProp = DrawerNavigationProp<MessagesDrawerParamList, "Tin nhắn">;
type ChatNavigationProp = StackNavigationProp<StrangeChatStackParamList, "StrangeMessages">;

const useStrangeMessage = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const navigation = useNavigation<MessagesNavigationProp>();
    const chatnavigation = useNavigation<ChatNavigationProp>();

    const [search, setSearch] = useState<string>("");
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const inputRef = useRef<TextInput>(null);
    const {
        getShortNames, 
        getOtherParticipantById
    } = useMessages();
    
    const [conversations, setConversations] = useState<Conversation[] | null>(null);
    const [listuser, setListUser] = useState<SearchConversations[] | null>(null);
    const [filterUser, setFilterUser] = useState<SearchConversations[] | null>(null);
    
    useEffect(() => {
        if (conversations){
            {conversations.map((conver) => {
                socket.emit("joinChat", conver._id);

                socket.on("newMessage", (newMessage) => {
                    setConversations((prevConversations) => {
                        if (!prevConversations) return null;
                
                        return prevConversations.map((conversation) =>
                            conversation._id === newMessage.conversationId
                                ? { ...conversation, lastMessage: newMessage }
                                : conversation
                        );
                    });
                });
                
            
                return () => {
                    socket.emit("leaveChat", conver._id);
                    socket.off("newMessage");
                };
            })}
        }
    }, [conversations]);
    
    useEffect(() => {
        if (conversations && userId){
           setListUser(
            conversations.map((item) => {
                if (item.type === "private"){
                    const userData = getOtherParticipantById(item, userId);
                    return {
                        conversationId: item._id,
                        name: userData?userData.displayName:"Người dùng không xác định",
                        avt: userData && userData.avt.length > 0 ? userData.avt[userData.avt.length - 1] : null,
                        type: 'private'
                    }
                } else if (item.type === "group"){
                    return {
                        conversationId: item._id,
                        name: item.groupName !== null? item.groupName : getShortNames(item),
                        avt: item.avtGroup !== null? item.avtGroup : null,
                        type: 'group'
                    }
                } else {
                    return {
                        conversationId: item._id,
                        name: item.pageId?item.pageId.name : "Page không xác định",
                        avt: item.pageId && item.pageId.avt? item.pageId.avt : null,
                        type: 'page'
                    }
                }
            })
           ) 
        }
    }, [conversations, userId]);

    useEffect(() => {
        if (listuser){
            setFilterUser(listuser);
        }
    }, [listuser]);

    const getUserId = async () => {
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
    }

    const getConversations = async () => {
        if (!userId) return;
        const conversationAPI = restClient.apiClient.service(`apis/conversations/user/${userId}/without-friend`);
        const result = await conversationAPI.get("");
        if (result.success){
            setConversations(result.data);
        }
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss();
        inputRef.current?.blur();
        setIsSearch(false);
    };

    const onPressHeaderLeft = () => {
        if (isSearch){
            dismissKeyboard()
        } else {
            handleOpenDrawer()
        }
    }

    const handleOpenDrawer = () => {
        navigation.openDrawer();
    };
    
    const searchUser = (value: string) => {
        if (!listuser) return;
      
        const normalizedValue = removeVietnameseTones(value.toLowerCase());
      
        const filteredUsers = listuser.filter((user) =>
          removeVietnameseTones(user.name).includes(normalizedValue)
        );
        setSearch(value);
        setFilterUser(filteredUsers);
    };

    return {
        getConversations,
        search, setSearch,
        isSearch, setIsSearch,
        inputRef, chatnavigation,
        conversations,
        onPressHeaderLeft,
        filterUser, searchUser,
        getUserId, userId
    }
}

export default useStrangeMessage;
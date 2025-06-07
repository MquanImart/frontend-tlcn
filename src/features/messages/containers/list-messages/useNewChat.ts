import { UserDisplay } from "@/src/interface/interface_flex";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import restClient from "@/src/shared/services/RestClient";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import { Keyboard, TextInput } from "react-native";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "NewChat">;

const useNewChat = () => {
    const navigation = useNavigation<ChatNavigationProp>();
    const [search, setSearch] = useState<string>("");
    const [isSearch, setIsSearch] = useState<boolean>(false);
    const inputRef = useRef<TextInput>(null);

    const [dataUser, setDataUser] = useState<UserDisplay[] | null>(null);
    const [filterUser, setFilterUser] = useState<UserDisplay[] | null>(null);

    useEffect(() => {
        if (dataUser){
            setFilterUser(dataUser);
        }
    }, [dataUser]);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
        inputRef.current?.blur();
        setIsSearch(false);
    };

    const goBack = () => {
        navigation.goBack();
    }

    const navigateNewGroupChat = () => {
        navigation.navigate("NewGroupChat", {});
    }
    
    const getUserWithoutChat = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const conversationAPI = restClient.apiClient.service(`apis/conversations/user/${userId}/new-chat`);
        const result = await conversationAPI.find({});
        if (result.success){
            setDataUser(result.data);
        }
    }

    const searchUser = (value: string) => {
        if (!dataUser) return;
      
        const normalizedValue = removeVietnameseTones(value.toLowerCase());
      
        const filteredUsers = dataUser.filter((user) =>
          removeVietnameseTones(user.displayName).includes(normalizedValue)
        );
        setSearch(value);
        setFilterUser(filteredUsers);
    };

    const createNewChat = (friend: UserDisplay) => {
        navigation.navigate("BoxChat", {conversationId: null, friend: {
            _id: friend._id,
            displayName: friend.displayName,
        }})
    };

    return {
        search, searchUser,
        isSearch, setIsSearch, inputRef,
        dismissKeyboard, filterUser,
        goBack, navigateNewGroupChat,
        getUserWithoutChat, createNewChat
    }
}

export default useNewChat;
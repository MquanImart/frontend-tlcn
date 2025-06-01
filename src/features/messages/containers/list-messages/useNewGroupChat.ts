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

const useNewGroupChat = (defaultChoose?: UserDisplay[]) => {
    const navigation = useNavigation<ChatNavigationProp>();
    const [search, setSearch] = useState<string>("");
    const [isSearch, setIsSearch] = useState<boolean>(false);

    const [name, setName] = useState<string>("");

    const inputRef = useRef<TextInput>(null);
    const [selected, setSelected] = useState<UserDisplay[]>(defaultChoose?defaultChoose:[]);

    const [dataUser, setDataUser] = useState<UserDisplay[] | null> (null);
    const [filterUser, setFilterUser] = useState<UserDisplay[] | null> (null);

    useEffect(() => {
        if (dataUser){
            setFilterUser(dataUser);
        }
    }, [dataUser]);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
        inputRef.current?.blur();
    };

    const goBack = () => {
        navigation.goBack();
    }

    const getUserWithoutChat = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const conversationAPI = restClient.apiClient.service(`apis/users/${userId}/friends`);
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

    const handleSelected = (_id: string) => {
        if (dataUser){
            setSelected((prevSelected) => {
                // Kiểm tra xem phần tử đã tồn tại trong danh sách selected chưa
                const alreadySelected = prevSelected.some((item) => item._id === _id);
                if (alreadySelected) {
                  // Nếu đã tồn tại, loại bỏ phần tử khỏi danh sách
                  return prevSelected.filter((item) => item._id !== _id);
                } else {
                  // Nếu chưa tồn tại, tìm phần tử từ cardUserData và thêm vào danh sách
                  const selectedItem = dataUser.find((item) => item._id === _id);
                  return selectedItem ? [...prevSelected, selectedItem] : prevSelected;
                }
              });
        }
    };

    const createGroup = async () => {
        if (selected.length <= 1){
            alert("Nhóm phải từ 3 người trở lên");
            return;
        }
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const conversationAPI = restClient.apiClient.service(`apis/conversations`);
        const participants = selected.map((item) => item._id);

        const result = await conversationAPI.create({
            creatorId: userId,
            participants: [...participants, userId],
            groupName: name === ""? null : name,
            lastMessage: {
                sender: userId,
                contentType: "text",
                message: "Xin chào",
              }
          });
        if (result.success){
            navigation.reset({
              index: 1,
              routes: [
                { name: "ListMessages" },
                { name: "BoxChat", params: { conversationId: result.data._id } },
              ],
            });
        }
    }

    const addMemberGroup = async (conversationId: string) => {
        if (selected.length <= 1){
            alert("Nhóm phải từ 3 người trở lên");
            return;
        }
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const conversationAPI = restClient.apiClient.service(`apis/conversations/${conversationId}/add-member`);
        const result = await conversationAPI.patch("", {
            userIds: selected.map((s) => s._id)
        });
        if (result.success){
            navigation.reset({
              index: 1,
              routes: [
                { name: "ListMessages" },
                { name: "BoxChat", params: { conversationId: conversationId } },
              ],
            });
        }
    }

    return {
        search, searchUser,
        isSearch, setIsSearch, inputRef,
        dismissKeyboard,  goBack,
        handleSelected, getUserWithoutChat,
        setName, name,
        selected, filterUser,
        createGroup, addMemberGroup
    }
}

export default useNewGroupChat;

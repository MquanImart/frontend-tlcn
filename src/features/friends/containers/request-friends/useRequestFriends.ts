import { AddFriend, MyPhoto } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

interface UserAddFriends {
    _id: string;
    displayName: string;
    avt: MyPhoto[];
    aboutMe: string;
}

export interface FriendCardData {
    addFriend: AddFriend;
    sender: UserAddFriends;
    receiver: UserAddFriends;
    mutualFriends: string[];
    mutualGroups: string[];
}
const useRequestFriends = () => {
    const [requestFriendsToMe, setRequestFriendsToMe] = useState<FriendCardData[] | null>(null);
    const [requestFriendsToOther, setRequestFriendsToOther] = useState<FriendCardData[] | null>(null);

    const getDataFriendsToMe = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const friendsAPI = restClient.apiClient.service(`apis/add-friends/receive`);
        const result = await friendsAPI.get(userId);
        setRequestFriendsToMe(result.data);
    }

    const getDataFriendsToOther = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const friendsAPI = restClient.apiClient.service(`apis/add-friends/sender`);
        const result = await friendsAPI.get(userId);
        setRequestFriendsToOther(result.data);
    }

    const ReplyRequest = async (id: string, status: "approved" | "rejected") => {
        const friendsAPI = restClient.apiClient.service(`apis/add-friends`);
        const result = await friendsAPI.patch(id, {status: status})

        if (result.success){
            // Lọc bỏ phần tử có addFriend._id === id trong danh sách requestFriendsToMe
            setRequestFriendsToMe(prev => prev ? prev.filter(friend => friend.addFriend._id !== id) : null);
            
            // Lọc bỏ phần tử có addFriend._id === id trong danh sách requestFriendsToOther
            setRequestFriendsToOther(prev => prev ? prev.filter(friend => friend.addFriend._id !== id) : null);
        }
    }

    return {
        requestFriendsToMe, requestFriendsToOther,
        getDataFriendsToMe, getDataFriendsToOther,
        ReplyRequest, 
    }
}

export default useRequestFriends;
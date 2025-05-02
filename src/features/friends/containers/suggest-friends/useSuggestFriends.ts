import { MyPhoto } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export interface SuggestFriends {
    friend: {
        _id: string;
        displayName: string;
        avt: MyPhoto[];
        aboutMe?: string;
    },
    count: number;
}

const useSuggestFriends = () => {
    const [allFriends, setAllFriends] = useState<SuggestFriends[] | null>(null);
    const [filterFriends, setFilterFriends] = useState<SuggestFriends[] | null>(null);
    const [isAddFriends, setIsAddFriends] = useState<boolean>(false);
    const [selectedFriends, setSelectedFriends] = useState<string | null>(null);

    useEffect(() => {
        if (allFriends){
            setFilterFriends(allFriends);
        }
    }, [allFriends]);

    const getAllFriends = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const friendsAPI = restClient.apiClient.service(`apis/users/${userId}/suggest`);
        const result = await friendsAPI.find({});
        if (result.success){
            setAllFriends(result.data);
        }
    }

    const addFriends = async (friendId: string | null, messages: string) => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        if (!friendId) return;
        const friendsAPI = restClient.apiClient.service(`apis/add-friends`);
        const result = await friendsAPI.create({
            senderId: userId, 
            receiverId: friendId,
            message: messages
        })
        if (result.success){
            setFilterFriends((prevFriends) => 
                prevFriends ? prevFriends.filter(friend => friend.friend._id !== friendId) : null
            );
        }
    }

    const deleteFriends = async (friendId: string) => {
        setFilterFriends((prevFriends) => 
            prevFriends ? prevFriends.filter(friend => friend.friend._id !== friendId) : null
        );
    }

    const onCloseModel = async () => {
        setIsAddFriends(false);
        setSelectedFriends(null)
    }

    const onOpenModel = async (_id: string) => {
        setIsAddFriends(true);
        setSelectedFriends(_id)
    }
        
    return {
        filterFriends, 
        getAllFriends, 
        addFriends, deleteFriends,
        isAddFriends, onCloseModel, onOpenModel,
        selectedFriends
    }
}

export default useSuggestFriends;
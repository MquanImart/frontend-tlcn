import { MyPhoto } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export interface DataFriends {
    _id: string;
    displayName: string;
    avt: MyPhoto[];
    aboutMe?: string;
}

const useAllFriends = () => {
    const [allFriends, setAllFriends] = useState<DataFriends[] | null>(null);
    const [filterFriends, setFilterFriends] = useState<DataFriends[] | null>(null);
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        if (allFriends){
            setFilterFriends(allFriends);
        }
    }, [allFriends]);

    const getAllFriends = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const friendsAPI = restClient.apiClient.service(`apis/users/${userId}/friends`);
        const result = await friendsAPI.find({});
        if (result.success){
            setAllFriends(result.data);
        }
    }

    const unFriends = async (friendId: string) => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const friendsAPI = restClient.apiClient.service(`apis/users/${userId}/unfriend`);
        const result = await friendsAPI.patch("", {friendId: friendId});
        if (result.success){
            setFilterFriends((prevFriends) => 
                prevFriends ? prevFriends.filter(friend => friend._id !== friendId) : null
            );
        }
    }

    const handleSearch = (value: string) => {
            const keyword = removeVietnameseTones(value);
        
            if (allFriends){
                const filteredData = allFriends.filter((item) => {
                    const name = removeVietnameseTones(item.displayName); 
            
                    return name.includes(keyword);
                });
            
                setFilterFriends(filteredData);
            }
        };
        
    return {
        filterFriends, search,
        getAllFriends, setSearch,
        handleSearch, unFriends
    }
}

export default useAllFriends;
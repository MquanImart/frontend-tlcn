import restClient from "@/src/shared/services/RestClient";
import { useEffect, useState } from "react";
import { FriendCardData } from "./useRequestFriends";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";

const useAllRequest = (source: FriendCardData[]) => {

    const [allData, setAllData] = useState<FriendCardData[]>(source);
    const [filterData, setFilterData] = useState<FriendCardData[]>(source);
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        setAllData(source);
    }, [source]);

    useEffect(() => {
        setFilterData(allData);
    }, [allData]);

    const ReplyRequest = async (id: string, status: "approved" | "rejected") => {
        const friendsAPI = restClient.apiClient.service(`apis/add-friends`);
        const result = await friendsAPI.patch(id, {status: status})
    }

    const handleSearch = (value: string, isSendMe: boolean) => {
        const keyword = removeVietnameseTones(value);
    
        const filteredData = allData.filter((item) => {
            const name = removeVietnameseTones(
                isSendMe ? item.sender.displayName : item.receiver.displayName
            ); 
    
            return name.includes(keyword);
        });
    
        setFilterData(filteredData);
    };

    return {
        allData, filterData,
        ReplyRequest, 
        search, setSearch,
        handleSearch
    }
}

export default useAllRequest;
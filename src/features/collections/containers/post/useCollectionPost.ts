import restClient from "@/src/shared/services/RestClient";
import { useState } from "react";
import { ViewCardArticle, ViewCardCollection } from "./interface";
import { Collection } from "@/src/interface/interface_reference";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useCollectionPost = () => {
    const [recentPost, setRecentPost] = useState<ViewCardArticle[]>([]);
    const [collections, setCollections] = useState<ViewCardCollection[]>([]);
    const [listCollections, setListCollections] = useState<Collection[]>([]);


    const getRecentPost = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const userClient = restClient.apiClient.service(`apis/users/${userId}/collections-recent`);
        const result = await userClient.find({limit: 3})
        setRecentPost(result.data);
    }

    const getCollections = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const userClient = restClient.apiClient.service(`apis/users/${userId}/collections`);
        const result = await userClient.find({});
        setCollections(result.data);
    }

    const getListCollections = async () => {
        const userClient = restClient.apiClient.service(`apis/collections`);
        const result = await userClient.find({});
        setListCollections(result.data);
    }

    const deleteArticle = async (itemId: string, collectionId: string) => {
        try {
            const userClient = restClient.apiClient.service(`apis/collections/${collectionId}/item`);
            const result = await userClient.patch("", { itemId });
            if (result.success) {
                setRecentPost(prevPosts => prevPosts.filter(article => article.article._id !== itemId || article.collectionId !== collectionId));
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
        }
    }

    const changeCollection = async (currCollectionId: string, newCollectionId: string, itemId: string) => {
        const userClient = restClient.apiClient.service(`apis/collections/item/change`);
        const result = await userClient.patch("", {
            currCollectionId: currCollectionId,
            newCollectionId: newCollectionId,
            itemId: itemId
        })
    }

    const createCollection = async (name: string) => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        try {
            const userClient = restClient.apiClient.service(`apis/users/collections`);
            const result = await userClient.create({
                userId: userId,
                name: name,
                type: "article"
              })
            if (result.success){
                setCollections(prev => [...prev, {
                    collection: result.data,
                    imgDefault: "https://storage.googleapis.com/kltn-hcmute/public/default/default_article.png"}
                ]);
                setListCollections(prev => [...prev, result.data]);
                return result.data;
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
        }
    }

    return {
        recentPost, getRecentPost,
        collections, getCollections,
        listCollections, getListCollections,
        deleteArticle, changeCollection,
        createCollection
    }
}

export default useCollectionPost;
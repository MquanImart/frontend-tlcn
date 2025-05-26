import restClient from "@/src/shared/services/RestClient";
import { useState } from "react";
import { CollectionDetails, ViewCardCollection } from "./interface";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useDetails = () => {
    const [articles, setArticles] = useState<CollectionDetails | null>(null);
    const [listCollections, setListCollections] = useState<ViewCardCollection[]>([]);

    const getArticles = async (collectionId: string) => {
        const userClient = restClient.apiClient.service(`apis/collections/${collectionId}/article`);
        const result = await userClient.find({});
        setArticles(result.data);
    }

    const getListCollections = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (userId){
            const userClient = restClient.apiClient.service(`apis/users/${userId}/collections`);
            const result = await userClient.find({});
            setListCollections(result.data);
        }
    }

    const deleteArticle = async (itemId: string, collectionId: string) => {
        try {
            const userClient = restClient.apiClient.service(`apis/collections/${collectionId}/item`);
            const result = await userClient.patch("", { itemId });
            if (articles && result.success) {
                setArticles(prev => 
                    prev 
                        ? { 
                            ...prev, 
                            items: prev.items.filter(article => 
                                !(article.article._id === itemId)
                            ) 
                        } 
                        : null
                );
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
        }
    }

    const changeCollection = async (currCollectionId: string, newCollectionId: string, itemId: string) => {
        try {
            if (newCollectionId === currCollectionId) return;
            const userClient = restClient.apiClient.service(`apis/collections/item/change`);
            const result = await userClient.patch("", {
                currCollectionId: currCollectionId,
                newCollectionId: newCollectionId,
                itemId: itemId
            })

            if (articles && result.success) {
                setArticles(prev => 
                    prev 
                        ? { 
                            ...prev, 
                            items: prev.items.filter(article => 
                                !(article.article._id === itemId)
                            ) 
                        } 
                        : null
                );
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
        }
    }

    const renameCollection = async (collectionId: string, name: string) => {
        try {
            const userClient = restClient.apiClient.service(`apis/collections`);
            const result = await userClient.patch(collectionId, {name: name})
            if (result.success){
                setArticles(prev => prev ? { ...prev, name: name } : null);
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
        }
    }

    const deleteCollection = async (collectionId: string) => {
        try {
            const userClient = restClient.apiClient.service(`apis/collections`);
            const result = await userClient.remove(collectionId)
            if (result.success){
                return true;
            }
        } catch (error) {
            console.error("Có lỗi xảy ra:", error);
        }
        return false;
    }

    return {
        articles, getArticles,
        listCollections, getListCollections,
        deleteArticle, changeCollection,
        renameCollection, deleteCollection
    }
}

export default useDetails;
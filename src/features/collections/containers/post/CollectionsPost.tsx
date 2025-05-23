import { KeyboardAvoidingView, Pressable, View, StyleSheet } from "react-native"
import RecentsView from "./RecentsView";
import { ScrollView } from "react-native-gesture-handler";
import ListCollections from "./ListCollections";
import { useCallback, useState } from "react";
import useCollectionPost from "./useCollectionPost";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";

interface CollectionPostProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const CollectionPost = ({handleScroll}: CollectionPostProps) => {
    
    const { recentPost, getRecentPost,
        collections, getCollections,
        listCollections, getListCollections,
        deleteArticle, changeCollection,
        createCollection } = useCollectionPost();

    useFocusEffect(
        useCallback(() => {
            getRecentPost();
            getCollections();
            getListCollections();
        }, [])
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <ScrollView style={styles.content} onScroll={handleScroll}>
                {recentPost?(
                    <RecentsView 
                    recentPost={recentPost}
                    deleteArticle={deleteArticle}
                    changeCollection={changeCollection}
                    listCollections={listCollections}
                />
                ):(
                    <View>
                    </View>
                )}
                <ListCollections collections={collections} createCollection={createCollection}/>
            </ScrollView>
            
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
    }
})

export default CollectionPost;
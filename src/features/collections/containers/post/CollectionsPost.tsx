import { KeyboardAvoidingView, View, StyleSheet } from "react-native"
import RecentsView from "./RecentsView";
import { ScrollView } from "react-native-gesture-handler";
import ListCollections from "./ListCollections";
import { useCallback } from "react";
import useCollectionPost from "./useCollectionPost";
import { useFocusEffect } from "@react-navigation/native";

interface CollectionPostProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const CollectionPost = ({handleScroll}: CollectionPostProps) => {
    
    const { recentPost, getRecentPost,
        collections, getCollections,
        deleteArticle, changeCollection,
        createCollection } = useCollectionPost();

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getRecentPost();
                await getCollections();
            }
            load();
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
                    listCollections={collections}
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
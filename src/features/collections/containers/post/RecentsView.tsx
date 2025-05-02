import { Text, View, StyleSheet } from "react-native"
import PostCard, { PostCardProps } from "../../components/PostCard";
import getColor from "@/src/styles/Color";
import { ViewCardArticle } from "./interface";
import { Collection } from "@/src/interface/interface_reference";

const Color = getColor();

interface RecentsViewProps {
    recentPost: ViewCardArticle[];
    deleteArticle: (itemId: string, collectionId: string) => void;
    changeCollection: (currCollectionId: string, newCollectionId: string, itemId: string) => void;
    listCollections: Collection[];
}
const RecentsView = ({recentPost, deleteArticle, changeCollection, listCollections} : RecentsViewProps) => {

    return (
        <View style={styles.container}>
            <Text style={styles.textTilte}>Đã lưu gần đây</Text>
            <View style={styles.boxContent}>
                {recentPost.map((item, index) => 
                    <View key={index} style={styles.item}>
                        <PostCard content={item.article.content}
                            author={item.author}
                            savedDate={item.updateDate}
                            img={item.representImg} 
                            _id={item.article._id} 
                            collectionId={item.collectionId?item.collectionId:""}      
                            deleteArticle={deleteArticle} 
                            changeCollection={changeCollection}
                            listCollections={listCollections}             
                        />
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    textTilte: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10, marginHorizontal: 20,
    },
    boxContent: {
        width: '100%',
        
    },
    item: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: Color.backGround,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    }
})

export default RecentsView;
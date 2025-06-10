import CButton from "@/src/shared/components/button/CButton";
import CHeader from "@/src/shared/components/header/CHeader";
import { CollectionStackParamList } from "@/src/shared/routes/CollectionNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { View, StyleSheet, ActivityIndicator } from "react-native"
import PostCard from "../../components/PostCard";
import { FlatList } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import useDetails from "./useDetails";
import InputCollectionModal from "../../components/InputCollectionModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

type RouteParams = {
    collectionId: string;
};

type CollectionsNavigationProp = StackNavigationProp<CollectionStackParamList, "Collections">;

const DetailsCollections = () => {
    useTheme();
    const route = useRoute();
    const { collectionId } = route.params as RouteParams;
    const navigation = useNavigation<CollectionsNavigationProp>();

    const {articles, getArticles, 
        deleteArticle, changeCollection, 
        listCollections, getListCollections, 
        deleteCollection, renameCollection} = useDetails();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibleDelete, setModalVisibleDelete] = useState(false);

    const handleInput = (value: string) => {
        renameCollection(collectionId, value);
    };

    const handleDeleteCollection = () => {
        deleteCollection(collectionId);
        setModalVisibleDelete(false);
        navigation.goBack();
    };

    useEffect(() => {
        getArticles(collectionId);
        getListCollections();
    }, []);

    if (articles === null) return <ActivityIndicator/>

    return (
        <View style={styles.container}>
            <CHeader label={articles.name} backPress={() => {navigation.goBack()}}/>
            {articles.name !== "Tất cả bài viết đã lưu" && <View style={styles.boxButton}>
                <CButton label={"Đổi tên"} onSubmit={() => setModalVisible(true)} 
                    style={{
                    width: "40%",
                    height: 35,
                    backColor: Color.mainColor2,
                    textColor: Color.textColor2,
                }}/>
                <View style={styles.padding}/>
                <CButton label={"Xóa"} onSubmit={() => setModalVisibleDelete(true)} 
                    style={{
                    width: "40%",
                    height: 35,
                    backColor: Color.mainColor2,
                    textColor: Color.textColor2,
                }}/>
            </View>}
            <FlatList data={articles.items} renderItem={({item, index})=> 
                <View key={index} style={styles.item}>
                    <PostCard 
                        _id={item.article._id}
                        content={item.article.content}
                        author={item.author}
                        savedDate={item.updateDate}
                        img={item.representImg}
                        collectionId={articles._id} 
                        deleteArticle={deleteArticle}
                        changeCollection={changeCollection}
                        listCollections={listCollections}                    
                    />
                </View>
            }/>
            <InputCollectionModal 
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onInput={handleInput}
                initialName={articles.name} label={"Đổi tên Bộ Sưu Tập"}            
            />
            <ConfirmDeleteModal
                visible={modalVisibleDelete} 
                onClose={() => setModalVisibleDelete(false)} 
                onConfirm={handleDeleteCollection} 
                collectionName={articles.name} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    boxButton: {
        justifyContent: 'center',
        padding: 10,
        flexDirection: 'row',
    },
    padding: {
        paddingHorizontal: 5,
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

export default DetailsCollections;

import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import getColor from "@/src/styles/Color";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, StyleSheet, Image, FlatList, Dimensions, ActivityIndicator } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import usePhotoAndFile from "./usePhotoAndFile";
import { ResizeMode, Video } from "expo-av";
import DetailsPhoto from "../../components/DetailsPhoto";
import { MyPhoto } from "@/src/interface/interface_reference";
import { Message } from "@/src/interface/interface_flex";

const Color = getColor();
const WINDOW_HEIGHT = Dimensions.get('window').height;
const IMAGE_SIZE = Dimensions.get('window').width / 2 - 4;

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "NewChat">;

const PhotoAndFile = () =>{
    const tabs : TabProps[] = [
        {label: 'Ảnh'},
        {label: 'Video'},
    ];
    const route = useRoute<RouteProp<ChatStackParamList, "PhotoAndFile">>();
    const { conversationId } = route.params || {};
    const navigation = useNavigation<ChatNavigationProp>();
    const videoRef = useRef(null);
    const [visiable, setVisiable] = useState<boolean>(false);
    const [dataImg, setDataImg] = useState<MyPhoto | null>(null);

    const { 
        messageImages, messageVideos, 
        getAllMessageImages, getAllMessageVideos,
        loadMoreMessagesImage, loadMoreMessagesVideo
    } = usePhotoAndFile(conversationId);
    const [currTab, setCurrTab] = useState<string>(tabs.length > 0?tabs[0].label:''); 
    
    useEffect(() => {
        getAllMessageImages();
        getAllMessageVideos();
    }, []);

    const selectedImg = (messageId: string) => {
        if (!messageImages) return;
        const message = messageImages.find(message => message._id === messageId) || null;
        if (message){
            setDataImg(message.content.mediaUrl ? message.content.mediaUrl : null)
            setVisiable(true);
        }
    }
    const renderItemImage = ({ item }: { item: Message }) => (
        <TouchableOpacity style={styles.boxImg}
            onPress={() => {selectedImg(item._id)}}
        >
            <Image
              style={styles.img}
              source={ item.content.mediaUrl ? { uri: item.content.mediaUrl.url} : require('@/src/assets/images/default/default_images.png')}
              resizeMode="cover" // Giữ nguyên tỉ lệ, không cắt ảnh
            />
        </TouchableOpacity>
    );

    const renderItemVideo = ({ item }: { item: Message }) => (
        <View style={styles.imageContainer}>
            <Video
                ref={videoRef}
                style={styles.video}
                source={{uri: item.content.mediaUrl?item.content.mediaUrl.url: ""}} 
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                shouldPlay={false}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBack} onPress={() => {navigation.goBack()}}>
                    <Icon name={"arrow-back-ios"} size={24} color={Color.white_contrast}/>
                </TouchableOpacity>
                <View style={styles.tabs}>
                    <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab}/>
                </View>
            </View>
            {messageImages !== null ? (
            <View>
                {currTab === tabs[0].label && 
                    <FlatList
                      style={styles.boxList}
                      data={messageImages}
                      keyExtractor={(item) => item._id}
                      renderItem={renderItemImage}
                      numColumns={2}
                      columnWrapperStyle={styles.row}
                      contentContainerStyle={styles.list}
                      onEndReached={loadMoreMessagesImage} // Khi cuộn lên, tải thêm tin nhắn
                      onEndReachedThreshold={0.2} // Khi cuộn gần 20% danh sách thì tải tiếp
                      showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
                      showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang (nếu có)
                    />
                }
                </View>
            ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
            )}
            {messageVideos !== null ? (
            <View>
                {currTab === tabs[1].label && 
                    <FlatList
                      style={styles.boxList}
                      data={messageVideos}
                      keyExtractor={(item) => item._id}
                      renderItem={renderItemVideo}
                      numColumns={2}
                      columnWrapperStyle={styles.row}
                      contentContainerStyle={styles.list}
                      onEndReached={loadMoreMessagesVideo} // Khi cuộn lên, tải thêm tin nhắn
                      onEndReachedThreshold={0.2} // Khi cuộn gần 20% danh sách thì tải tiếp
                      showsVerticalScrollIndicator={false} // Ẩn thanh cuộn dọc
                      showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn ngang (nếu có)
                    />
                }
                </View>
            ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
            )}
            <DetailsPhoto source={dataImg} 
                isModalVisible={visiable} closeModal={() => {setVisiable(false)}}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, paddingTop: 30,
        backgroundColor: Color.backGround
    },
    header: {
        width: '100%',
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBack: {
        width: '10%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabs: {
        width: '90%',
    },
    boxList: {
        maxHeight: WINDOW_HEIGHT - 100,
    },
    list: {
        paddingVertical: 16,
    },
    row: {
        justifyContent: 'space-around',
        marginBottom: 4,
    },
    imageContainer: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    boxImg: {
        width: '49%',
        height: 200,
        borderRadius: 5
    },
    img: {
        width: "100%", height: '100%',
        borderRadius: 5
    },
    video: {
        width: '100%',
        height: 200,
    },
})

export default PhotoAndFile;
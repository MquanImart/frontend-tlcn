import { Message } from "@/src/interface/interface_flex";
import { MyPhoto } from "@/src/interface/interface_reference";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ResizeMode, Video } from "expo-av";
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import DetailsPhoto from "../../components/DetailsPhoto";
import usePhotoAndFile from "./usePhotoAndFile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WINDOW_HEIGHT = Dimensions.get('window').height;
const IMAGE_SIZE = Dimensions.get('window').width / 2 - 4;

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "NewChat">;

const PhotoAndFile = () =>{
    useTheme();
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
    const insets = useSafeAreaInsets();

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
              resizeMode="cover"
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
        <View style={[styles.container, { backgroundColor: Color.background, paddingTop: insets.top }]}>
            <View style={[styles.header, { backgroundColor: Color.backgroundSecondary }]}>
                <TouchableOpacity style={styles.iconBack} onPress={() => {navigation.goBack()}}>
                    <Icon name={"arrow-back-ios"} size={24} color={Color.textPrimary}/>
                </TouchableOpacity>
                <View style={styles.tabs}>
                    <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab}/>
                </View>
            </View>
            {messageImages !== null && messageVideos !== null ? (
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
                      onEndReached={loadMoreMessagesImage}
                      onEndReachedThreshold={0.2}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                    />
                }
                {currTab === tabs[1].label &&
                    <FlatList
                      style={styles.boxList}
                      data={messageVideos}
                      keyExtractor={(item) => item._id}
                      renderItem={renderItemVideo}
                      numColumns={2}
                      columnWrapperStyle={styles.row}
                      contentContainerStyle={styles.list}
                      onEndReached={loadMoreMessagesVideo}
                      onEndReachedThreshold={0.2}
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                    />
                }
                </View>
            ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.background }}><ActivityIndicator size="large" color={Color.mainColor2}/></View>
            )}
            <DetailsPhoto source={dataImg}
                isModalVisible={visiable} closeModal={() => {setVisiable(false)}}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
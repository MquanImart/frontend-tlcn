import { Message, UserDisplay } from "@/src/interface/interface_flex";
import getColor from "@/src/styles/Color";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Image, Text, View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import DetailsPhoto from "../../components/DetailsPhoto";
import MapMessage from "./MapMessage";

const WINDOW_WIDTH =  Dimensions.get('window').width;
const Color = getColor();

interface MessageProps {
    user: UserDisplay;
    message: Message;
    showAvatar: boolean;
}

const MessageReceive = ({user, message, showAvatar}: MessageProps) => {
    const videoRef = useRef(null);  
    const [visiable, setVisiable] = useState<boolean>(false);

    return (
        <View style={styles.container}>
            {showAvatar?<Image style={styles.images} source={{uri: user.avt.length > 0 ? user.avt[user.avt.length - 1] : "https://picsum.photos/200"}}/> 
            : <View style={styles.images}/>}
            <View style={styles.boxContent}>
                {showAvatar && <Text style={styles.nameUser}>{user.displayName}</Text>}
                <View style={message.content.contentType === "text" ? styles.boxMessage : styles.boxMessage_Photo}>
                {message.content.contentType === "text" ? (
                    <Text style={styles.message}>{message.content.message}</Text>
                ) : message.content.contentType === "img" ? (
                    <TouchableOpacity style={styles.boxImg}
                        onPress={() => {setVisiable(true)}}
                    >
                        <Image
                          style={styles.img}
                          source={{ uri: message.content.mediaUrl ? message.content.mediaUrl.url : "https://picsum.photos/200" }}
                          resizeMode="cover" // Giữ nguyên tỉ lệ, không cắt ảnh
                        />
                    </TouchableOpacity>
                ) : message.content.contentType === "video" ? (
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{uri: message.content.mediaUrl?message.content.mediaUrl.url: ""}} 
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        shouldPlay={true}
                    />
                ) : message.content.contentType === "map" ? (
                    <View>
                        <MapMessage addressString={message.content.message?message.content.message:"lat:0 long:0"}/>
                        <View style={{marginTop: 5}}/>
                        <View style={styles.boxMessage}>
                            <Text style={styles.message}>Tôi đang gặp nạn! Giúp tôi!</Text>
                        </View>
                    </View>
                ) : (
                    <View/>
                )}
                </View>
            </View>
            <DetailsPhoto source={message.content.mediaUrl?message.content.mediaUrl:null} 
                isModalVisible={visiable} closeModal={() => {setVisiable(false)}}/>
        </View>
    )
}

const MessageSend = ({user, message, showAvatar}: MessageProps) => {
    const videoRef = useRef(null);
    const [visiable, setVisiable] = useState<boolean>(false);

    return (
        <View style={styles.container_send}>  
            <View style={styles.boxContent_send}>
                {showAvatar && <Text style={styles.nameUser}>{user.displayName}</Text>}
                <View style={message.content.contentType === "text" ? styles.boxMessage_send : styles.boxMessage_Photo}>
                {message.content.contentType === "text" ? (
                    <Text style={styles.message_send}>{message.content.message}</Text>
                ) : message.content.contentType === "img" ? (
                    <TouchableOpacity style={styles.boxImg}
                        onPress={() => {setVisiable(true)}}
                    >
                        <Image
                          style={styles.img}
                          source={{ uri: message.content.mediaUrl ? message.content.mediaUrl.url : "https://picsum.photos/200" }}
                          resizeMode="cover" // Giữ nguyên tỉ lệ, không cắt ảnh
                        />
                    </TouchableOpacity>
                ) : message.content.contentType === "video" ? (
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{uri: message.content.mediaUrl?message.content.mediaUrl.url: ""}} 
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        shouldPlay={false}
                    />
                ) : message.content.contentType === "map" ? (
                    <View>
                        <MapMessage addressString={message.content.message?message.content.message:"lat:0 long:0"}/>
                        <View style={{marginTop: 5}}/>
                        <View style={styles.boxMessage_send}>
                            <Text style={styles.message_send}>Tôi đang gặp nạn! Giúp tôi!</Text>
                        </View>
                    </View>
                ) : (
                    <View/>
                )}
                </View>
            </View>
            {showAvatar?<Image style={styles.images} source={{uri: user.avt.length > 0 ? user.avt[user.avt.length - 1] : "https://picsum.photos/200"}}/> 
            : <View style={styles.images}/>}
            <DetailsPhoto source={message.content.mediaUrl?message.content.mediaUrl:null} 
                isModalVisible={visiable} closeModal={() => {setVisiable(false)}}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 1,
    },
    container_send: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginVertical: 1,
    },
    images: {
        width: 30, height: 30,
        borderRadius: 50,
        marginHorizontal: 5
    },
    boxContent: {
        width: WINDOW_WIDTH - 120
    },
    boxContent_send: {
        width: WINDOW_WIDTH - 120,
        alignItems: 'flex-end',
        
    },
    boxMessage: {
        backgroundColor: Color.white_homologous,
        maxWidth: '100%',
        borderBottomEndRadius: 10, borderBottomStartRadius: 10,
        borderTopEndRadius: 10,
        padding: 10
    },
    boxMessage_send: {
        backgroundColor: Color.white_contrast,
        maxWidth: '100%',
        borderBottomEndRadius: 10, borderBottomStartRadius: 10,
        borderTopStartRadius: 10,
        padding: 10
    },
    boxMessage_Photo: {
        width: '100%',
        height: 'auto',
    },
    nameUser: {
        fontWeight: '500',
        fontSize: 12,
        paddingVertical: 5
    },
    message: {
        fontWeight: '400',
        maxWidth: 300
    },
    message_send: {
        fontWeight: '400',
        maxWidth: 300,
        color: Color.textColor2
    },
    video: {
        width: '100%',
        height: 200,
    },
    boxImg: {
        width: WINDOW_WIDTH - 120,
        height: 200,
        borderRadius: 5
    },
    img: {
        width: "100%", height: '100%',
        borderRadius: 5
    }
})

export {MessageReceive, MessageSend};
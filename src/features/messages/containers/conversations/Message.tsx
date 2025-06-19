import { Message, UserDisplay } from "@/src/interface/interface_flex";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { ResizeMode, Video } from "expo-av";
import { Image } from 'expo-image';
import { useRef, useState } from "react";
import { Alert, Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DetailsPhoto from "../../components/DetailsPhoto";
import MapMessage from "./MapMessage";
import { useNavigation } from "expo-router"; // Assuming expo-router is correctly set up for useNavigation
import { StackNavigationProp } from "@react-navigation/stack";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import * as Location from "expo-location";

const WINDOW_WIDTH =  Dimensions.get('window').width;

interface MessageProps {
    user: UserDisplay;
    message: Message;
    showAvatar: boolean;
}

type ChatNavigation = StackNavigationProp<ChatStackParamList>;

const parseLatLong = (addressString: string) : {lat: number, long: number} => {
    try {
      const match = addressString.match(/lat:([-]?[\d.]+)\s+long:([-]?[\d.]+)/);
      if (!match) throw new Error("Invalid address format");

      const lat = parseFloat(match[1]);
      const long = parseFloat(match[2]);

      return { lat, long };
    } catch (error) {
      return {lat: 0, long: 0}
    }
};

const MessageReceive = ({user, message, showAvatar}: MessageProps) => {
    useTheme();
    const videoRef = useRef<Video>(null);
    const [visiable, setVisiable] = useState<boolean>(false);
    const navigation = useNavigation<ChatNavigation>();

    const getLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
    
      if (status === "denied") {
        Alert.alert(
          "Quyền vị trí bị từ chối",
          "Bạn đã từ chối quyền vị trí. Hãy vào cài đặt để cấp lại quyền.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    
      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Không thể truy cập vị trí",
            "Bạn cần cấp quyền vị trí trong cài đặt để sử dụng tính năng này.",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }
    
      const loc = await Location.getCurrentPositionAsync({});
      return loc;
    }
    const gotoMap = async (messageContent: string) => {
        const myLocation = await getLocation();
        const start = myLocation ? {
            latitude: myLocation.coords.latitude,
            longitude: myLocation.coords.longitude,
            displayName: "Vị trí của bạn"
        } : null;

        const location = parseLatLong(messageContent);
        navigation.navigate('Map', {
            screen: 'Directions',
            params: start? {
                start: start,
                end: {
                    latitude: location.lat,
                    longitude: location.long,
                    displayName: "Người gặp nạp"
                }
            }: {
                end: {
                    latitude: location.lat,
                    longitude: location.long,
                    displayName: "Người gặp nạp"
                }
            }
        })
    }

    return (
        <View style={styles.container}>
            {showAvatar ? (
                <Image style={styles.images} source={user.avt.length > 0 ? {uri: user.avt[user.avt.length - 1].url}: require('@/src/assets/images/default/default_user.png')}/>
            ) : (
                <View style={styles.emptyAvatarPlaceholder}/>
            )}
            <View style={styles.boxContent}>
                {showAvatar && <Text style={[styles.nameUser, { color: Color.textPrimary }]}>{user.displayName}</Text>}
                <View style={message.content.contentType === "text" ? [styles.boxMessage, { backgroundColor: Color.gray4 }] : styles.boxMessage_Photo}>
                {message.content.contentType === "text" ? (
                    <Text style={[styles.message, { color: Color.white }]}>{message.content.message}</Text>
                ) : message.content.contentType === "img" ? (
                    <TouchableOpacity style={styles.boxImg}
                        onPress={() => {setVisiable(true)}}
                    >
                        <Image
                          style={styles.img}
                          source={ message.content.mediaUrl ? { uri: message.content.mediaUrl.url} : require('@/src/assets/images/default/default_images.png')}
                          resizeMode="cover"
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
                    <TouchableOpacity onPress={() => {gotoMap(message.content.message?message.content.message:"lat:0 long:0")}}>
                        <MapMessage addressString={message.content.message?message.content.message:"lat:0 long:0"}/>
                        <View style={{marginTop: 5}}/>
                        <View style={[styles.boxMessage, { backgroundColor: Color.backgroundSecondary }]}>
                            <Text style={[styles.message, { color: Color.textPrimary }]}>Tôi đang gặp nạn! Giúp tôi!</Text>
                        </View>
                    </TouchableOpacity>
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
    useTheme();
    const videoRef = useRef<Video>(null);
    const [visiable, setVisiable] = useState<boolean>(false);
    const navigation = useNavigation<ChatNavigation>();
    
    const getLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
    
      if (status === "denied") {
        Alert.alert(
          "Quyền vị trí bị từ chối",
          "Bạn đã từ chối quyền vị trí. Hãy vào cài đặt để cấp lại quyền.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
    
      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Không thể truy cập vị trí",
            "Bạn cần cấp quyền vị trí trong cài đặt để sử dụng tính năng này.",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }
    
      const loc = await Location.getCurrentPositionAsync({});
      return loc;
    }
    
    const gotoMap = async (messageContent: string) => {
        const myLocation = await getLocation();
        const start = myLocation ? {
            latitude: myLocation.coords.latitude,
            longitude: myLocation.coords.longitude,
            displayName: "Vị trí của bạn"
        } : null;
      
        const location = parseLatLong(messageContent);
        navigation.navigate('Map', {
            screen: 'Directions',
            params: start? {
                start: start,
                end: {
                    latitude: location.lat,
                    longitude: location.long,
                    displayName: "Người gặp nạp"
                }
            }: {
                end: {
                    latitude: location.lat,
                    longitude: location.long,
                    displayName: "Người gặp nạp"
                }
            }
        })
    }
    
    return (
        <View style={styles.container_send}>
            <View style={styles.boxContent_send}>
                {showAvatar && <Text style={[styles.nameUser_send, { color: Color.textPrimary }]}>{user.displayName}</Text>}
                <View style={message.content.contentType === "text" ? [styles.boxMessage_send, { backgroundColor: Color.mainColor2 }] : styles.boxMessage_Photo_send}>
                {message.content.contentType === "text" ? (
                    <Text style={[styles.message_send, { color: Color.textOnMain2 }]}>{message.content.message}</Text>
                ) : message.content.contentType === "img" ? (
                    <TouchableOpacity style={styles.boxImg}
                        onPress={() => {setVisiable(true)}}
                    >
                        <Image
                          style={styles.img}
                          source={ message.content.mediaUrl ? { uri: message.content.mediaUrl.url} : require('@/src/assets/images/default/default_images.png')}
                          resizeMode="cover"
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
                    <TouchableOpacity onPress={() => {gotoMap(message.content.message?message.content.message:"lat:0 long:0")}}>
                        <MapMessage addressString={message.content.message?message.content.message:"lat:0 long:0"}/>
                        <View style={{marginTop: 5}}/>
                        <View style={[styles.boxMessage_send, { backgroundColor: Color.mainColor2 }]}>
                            <Text style={[styles.message_send, { color: Color.textOnMain2 }]}>Tôi đang gặp nạn! Giúp tôi!</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View/>
                )}
                </View>
            </View>
            {showAvatar ? (
                <Image style={styles.images} source={user.avt.length > 0 ? {uri: user.avt[user.avt.length - 1].url}: require('@/src/assets/images/default/default_user.png')}/>
            ) : (
                <View style={styles.emptyAvatarPlaceholder}/>
            )}
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
        marginVertical: 2,
        paddingHorizontal: 5,
    },
    container_send: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginVertical: 2,
        paddingHorizontal: 5,
    },
    images: {
        width: 30, height: 30,
        borderRadius: 15,
        marginHorizontal: 5,
        alignSelf: 'flex-end',
    },
    emptyAvatarPlaceholder: {
        width: 30,
        height: 30,
        marginHorizontal: 5,
    },
    boxContent: {
        flexShrink: 1,
        alignItems: 'flex-start',
    },
    boxContent_send: {
        flexShrink: 1,
        alignItems: 'flex-end',
    },
    boxMessage: {
        maxWidth: WINDOW_WIDTH * 0.75,
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10,
        borderTopEndRadius: 10,
        padding: 10,
        alignSelf: 'flex-start',
    },
    boxMessage_send: {
        maxWidth: WINDOW_WIDTH * 0.75,
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10,
        borderTopStartRadius: 10,
        padding: 10,
        alignSelf: 'flex-end',
    },
    boxMessage_Photo: {
        width: WINDOW_WIDTH * 0.75,
        height: 'auto',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    boxMessage_Photo_send: {
        width: WINDOW_WIDTH * 0.75,
        height: 'auto',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'flex-end',
    },
    nameUser: {
        fontWeight: '500',
        fontSize: 12,
        marginBottom: 3,
        marginLeft: 10,
    },
    nameUser_send: {
        fontWeight: '500',
        fontSize: 12,
        marginBottom: 3,
        marginRight: 10,
        alignSelf: 'flex-end',
    },
    message: {
        fontWeight: '400',
    },
    message_send: {
        fontWeight: '400',
    },
    video: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    boxImg: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
    },
    img: {
        width: "100%", height: '100%',
        borderRadius: 10,
    }
})

export { MessageReceive, MessageSend };
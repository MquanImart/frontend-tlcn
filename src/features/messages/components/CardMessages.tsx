import { Conversation } from "@/src/interface/interface_flex";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import timeAgo from "@/src/shared/utils/TimeAgo";
import getColor from "@/src/styles/Color";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { Image, Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import useMessages from "../containers/useMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Color = getColor();
type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMessages">;

export interface CardMessagesProps {
    conversation: Conversation;
}

const CardMessages = ({conversation}: CardMessagesProps) => {
    const { cardData } = useCardMessage(conversation);

    if (!cardData) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <TouchableOpacity style={styles.container} onPress={cardData.onPress}>
            <View style={styles.mainContent}>
                <Image source={{uri: cardData.avt}} style={styles.images}/>
                <View style={styles.content}>
                    <View style={styles.title}>
                        <Text style={[styles.name, cardData.isRead?{}:{fontWeight: 'bold'}]}>{cardData.name}</Text>
                        <Text style={[styles.date, cardData.isRead?{}:{fontWeight: 'bold'}]}>{timeAgo(cardData.sendDate)}</Text>
                    </View>
                    <Text
                      style={[styles.textContent, cardData.isRead?{}:{fontWeight: 'bold'}]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {cardData.userSend}: {cardData.message}
                    </Text>
                </View>
            </View>
            {!cardData.isRead && <View style={styles.dot}/>}
        </TouchableOpacity>
    )
}

export interface DataCardProps {
    name: string;
    avt: string;
    isRead: boolean;
    sendDate: number;
    userSend: string;
    message: string;
    onPress: () => void;
}

const useCardMessage = (conversation: Conversation) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [cardData, setCardData] = useState<DataCardProps | null> (null);
    const navigation = useNavigation<ChatNavigationProp>();
    const {
        getSenderName, getShortNames, 
        hasUserSeenLastMessage, getContent,
        getOtherParticipantById
    } = useMessages();

    useEffect(() => {
        getUserId();
    }, []);

    useEffect(() => {   
        if (conversation && userId){
            setCardData(getDataCard(conversation));
        }
    }, [userId, conversation]);

    const getUserId = async () => {
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
    }
    
    const getDataCard = (conversation: Conversation) : DataCardProps | null => {
        if (!userId) return null;
        if (conversation.type === "group") {
            return {
                name: conversation.groupName !== null? conversation.groupName : getShortNames(conversation),
                avt: conversation.avtGroup !== null? conversation.avtGroup : "https://picsum.photos/200",
                isRead: hasUserSeenLastMessage(conversation, userId),
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
                onPress: () => {navigation.navigate("BoxChat", {conversationId: conversation._id})}
            }
        } else if (conversation.type === "private") {

            const userData = getOtherParticipantById(conversation, userId);
            return {
                name: userData?userData.displayName:"Người dùng không xác định",
                avt: userData && userData.avt.length > 0 ? userData.avt[userData.avt.length - 1] : "https://picsum.photos/200",
                isRead: hasUserSeenLastMessage(conversation, userId),
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
                onPress: () => {navigation.navigate("BoxChat", {conversationId: conversation._id})}
            }
        } else {
            return {
                name: conversation.pageId?conversation.pageId.name : "Page không xác định",
                avt: conversation.pageId && conversation.pageId.avt? conversation.pageId.avt : "https://picsum.photos/200",
                isRead: true,
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
                onPress: () => {navigation.navigate("BoxChat", {conversationId: conversation._id})}
            }
        }

    }

    

    return {
        cardData
    }
    
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    images: {
        width: 50, height: 50,
        borderRadius: 50
    },
    mainContent: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    content: {
        width: '90%',
        paddingHorizontal: 10,
        justifyContent: 'space-between'
    },
    title: {
        height: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    name: {
        fontSize: 17
    },
    date: {
        fontSize: 10
    },
    textContent: {

    },
    dot: {
        width: 5, height: 5,
        borderRadius: 50,
        backgroundColor: Color.white_contrast
    }
})

export default CardMessages;
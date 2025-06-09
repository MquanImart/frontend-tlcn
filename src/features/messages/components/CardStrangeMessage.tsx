import { Conversation } from "@/src/interface/interface_flex";
import { MyPhoto } from "@/src/interface/interface_reference";
import timeAgo from "@/src/shared/utils/TimeAgo";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useMessages from "../containers/useMessage";

export interface CardMessagesProps {
    conversation: Conversation;
    onPress: () => void;
}   

const CardStrangeMessage = ({conversation, onPress}: CardMessagesProps) => {
    useTheme();
    const { cardData } = useCardMessage(conversation);

    if (!cardData) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.mainContent}>
                <Image source={cardData.avt ? {uri: cardData.avt?.url} : (
                    cardData.type === 'group'? require('@/src/assets/images/default/default_group_message.png'):
                    cardData.type === 'private'? require('@/src/assets/images/default/default_user.png'):
                    require('@/src/assets/images/default/default_page.jpg')
                )} style={styles.images}/>
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
    avt: MyPhoto | null;
    type: 'group' | 'private' | 'page';
    isRead: boolean;
    sendDate: number;
    userSend: string;
    message: string;
}

const useCardMessage = (conversation: Conversation) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [cardData, setCardData] = useState<DataCardProps | null> (null);
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
                avt: conversation.avtGroup !== null? conversation.avtGroup : null,
                type: 'group',
                isRead: hasUserSeenLastMessage(conversation, userId),
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
            }
        } else if (conversation.type === "private") {

            const userData = getOtherParticipantById(conversation, userId);
            return {
                name: userData?userData.displayName:"Người dùng không xác định",
                avt: userData && userData.avt.length > 0 ? userData.avt[userData.avt.length - 1] : null,
                type: 'private',
                isRead: hasUserSeenLastMessage(conversation, userId),
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
            }
        } else {
            return {
                name: conversation.pageId?conversation.pageId.name : "Page không xác định",
                avt: conversation.pageId && conversation.pageId.avt? conversation.pageId.avt : null,
                type: 'page',
                isRead: true,
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
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

export default CardStrangeMessage;
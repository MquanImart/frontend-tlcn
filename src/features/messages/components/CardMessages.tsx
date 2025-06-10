import { Conversation, ConversationSettings } from "@/src/interface/interface_flex";
import { MyPhoto } from "@/src/interface/interface_reference";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import timeAgo from "@/src/shared/utils/TimeAgo";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import useMessages from "../containers/useMessage";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "ListMessages">;

export interface CardMessagesProps {
    conversation: Conversation;
    isFriend?:boolean;
}

const CardMessages = ({conversation, isFriend}: CardMessagesProps) => {
    useTheme(); // Ensure this hook is called to get dynamic colors
    const { cardData, setting } = useCardMessage({conversation, isFriend});

    if (!cardData) {
        return (
            <View style={[styles.loadingContainer, {backgroundColor: Color.backgroundSecondary}]}>
                <ActivityIndicator size="small" color={Color.mainColor2} />
            </View>
        );
    }

    return (
        <TouchableOpacity style={[styles.container, {backgroundColor: Color.backgroundSecondary}]} onPress={cardData.onPress}>
            <View style={styles.mainContent}>
                <Image
                    source={cardData.avt ? {uri: cardData.avt?.url} : (
                        cardData.type === 'group' ? require('@/src/assets/images/default/default_group_message.png') :
                        cardData.type === 'private' ? require('@/src/assets/images/default/default_user.png') :
                        require('@/src/assets/images/default/default_page.jpg')
                    )}
                    style={styles.images}
                />
                <View style={styles.content}>
                    <View style={styles.title}> 
                      <Text 
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.name, { color: Color.black }, (cardData.isRead || setting?.notifications === false) ? {} : { fontWeight: 'bold' }]}>
                        {cardData.name}
                      </Text>
                      {setting?.notifications === false ? (
                        <MaterialIcons name="notifications-off" size={16} color={Color.textSecondary} /> 
                      ) : (
                        <Text style={[
                            styles.date,
                            { color: Color.textSecondary }, // Dynamic color for date
                            cardData.isRead ? {} : { fontWeight: 'bold' }
                        ]}>
                          {timeAgo(cardData.sendDate)}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                          styles.textContent,
                          { color: Color.textSecondary }, // Dynamic color for text content
                          (cardData.isRead || setting?.notifications === false) ? {} : { fontWeight: 'bold' }
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {cardData.userSend}: {cardData.message}
                    </Text>
                </View>
            </View>
            {!cardData.isRead && setting?.notifications !== false && ( // Only show dot if not read AND notifications are NOT off
                <View style={[styles.dot, { backgroundColor: Color.mainColor2 }]} /> // Dynamic color for dot
            )}
        </TouchableOpacity>
    );
};

export interface DataCardProps {
    name: string;
    avt: MyPhoto | null;
    isRead: boolean;
    type: 'group' | 'private' | 'page';
    sendDate: number;
    userSend: string;
    message: string;
    onPress: () => void;
}

const useCardMessage = ({conversation, isFriend} : CardMessagesProps) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [cardData, setCardData] = useState<DataCardProps | null> (null);
    const [setting, setSetting] = useState<ConversationSettings|null>(null);

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
            getSetting();
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
                onPress: () => {navigation.navigate("BoxChat", {conversationId: conversation._id})}
            }
        } else if (conversation.type === "private") {

            const userData = getOtherParticipantById(conversation, userId);
            return {
                name: userData?userData.displayName:"Người dùng không xác định",
                avt: userData && userData.avt.length > 0 ? userData.avt[userData.avt.length - 1] : null,
                isRead: hasUserSeenLastMessage(conversation, userId),
                type: 'private',
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
                onPress: () => {navigation.navigate("BoxChat", {conversationId: conversation._id, isFriend: isFriend})}
            }
        } else { // type === "page"
            const userData = getOtherParticipantById(conversation, userId);
            return {
                name: conversation.participants.some((user) => user._id === userId) ? (conversation.pageId?conversation.pageId.name : "Page không xác định") : (userData?userData.displayName:"Người dùng không xác định"),
                avt: conversation.pageId && conversation.pageId.avt? conversation.pageId.avt : null,
                isRead: true, // Assuming page messages are always considered read for simplicity or different handling
                type: 'page',
                sendDate: conversation.lastMessage?conversation.lastMessage.createdAt:0,
                userSend: getSenderName(conversation, userId),
                message: getContent(conversation),
                onPress: () => {navigation.navigate("BoxChat", {conversationId: conversation._id})}
            }
        }
    };

    const getSetting = () => {
        if (!userId) return; // return early if userId is null
        const userSettings = conversation.settings.filter((s) => s.userId === userId);
        if (userSettings.length > 0){
            setSetting(userSettings[0]);
        } else {
            setSetting(null); // Ensure setting is null if no specific setting is found
        }
    };

    return {
        cardData,
        setting
    };
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 8, // Added a slight border radius for card-like appearance
        marginVertical: 4, // Added vertical margin to separate cards
    },
    loadingContainer: {
        width: '100%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 70, // Ensure it has enough height to not collapse
    },
    images: {
        width: 50,
        height: 50,
        borderRadius: 25, // Half of width/height for perfect circle
    },
    mainContent: {
        flex: 1, // Allow mainContent to take up available space
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1, // Allow content to take up available space
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    title: {
        minHeight: 25, // Changed from fixed height to minHeight for flexibility
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    name: {
        fontSize: 17,
        flexShrink: 1, // Allow text to shrink
        marginRight: 5, // Small margin to separate from date/icon
        width: '80%',
    },
    date: {
        fontSize: 10,
        flexShrink: 0, // Prevent date from shrinking
    },
    textContent: {
        fontSize: 14, // Slightly smaller font for message content
    },
    dot: {
        width: 8, // Slightly larger dot for visibility
        height: 8,
        borderRadius: 4, // Half of width/height for perfect circle
        marginLeft: 10, // Margin to separate from text content
    },
});

export default CardMessages;
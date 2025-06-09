import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import restClient from "../../services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Conversation } from "@/src/interface/interface_flex";
import socket from "../../services/socketio";

interface HeaderMessagesProps {
    label: string;
    IconLeft: string;
    onPressLeft: () => void;
    IconRight?: string;
    onPressRight?: () => void;
    textRight?: string;
    borderIcon?: boolean;
}

const CHeaderIcon = ({label, IconLeft, onPressLeft, IconRight, onPressRight, textRight, borderIcon}: HeaderMessagesProps) => {
    useTheme()
    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.buttonIcon, borderIcon&&styles.borderIcon]} onPress={onPressLeft}>
                <Icon name={IconLeft} size={24} color={Color.white_contrast} />
            </TouchableOpacity>
            <Text style={styles.label}>{label}</Text>
            {(IconRight || textRight) ? <TouchableOpacity style={[styles.buttonIcon, borderIcon&&styles.borderIcon]} onPress={onPressRight}>
                {IconRight && <Icon name={IconRight} size={24} color={Color.mainColor1} />}
                {textRight && <Text style={styles.textIcon}>{textRight}</Text>}
            </TouchableOpacity> : <View style={styles.placeHolder}/>}
        </View>
    )
}

export const CHeaderIconNewFeed = ({label, IconLeft, onPressLeft, IconRight, onPressRight, textRight, borderIcon}: HeaderMessagesProps) => {
    const [numMessages, setNumMessages] = useState<number>(0);
    const [userId, setUserId] = useState<string|null>(null);
    const [conversations, setConversations] = useState<Conversation[] | null>(null);

    useEffect(() => {
        getUserId();
    },[]);

    useEffect(() => {
        getNumMessages();
    },[userId]);

    useEffect(() => {
        if (conversations && userId){
            {conversations.map((conver) => {
                socket.emit("joinChat", conver._id);

                socket.on("newMessage", (newMessage) => {
                    setConversations((prevConversations) => {
                        if (!prevConversations) return null;
                
                        return prevConversations.map((conversation) =>
                            conversation._id === newMessage.conversationId
                                ? { ...conversation, lastMessage: newMessage }
                                : conversation
                        );
                    });
                });
                
            
                return () => {
                    socket.emit("leaveChat", conver._id);
                    socket.off("newMessage");
                };
            })}
        }
    }, [conversations, userId]);

    useEffect(() => {
        let count = 0;
        if (conversations && userId)
            for (const conv of conversations) {
                const lastMsg = conv.lastMessage;
                if (!lastMsg) continue;
            
                const userSetting = conv.settings.find(s => s.userId === userId);
                if (
                  userSetting &&
                  userSetting.active &&
                  userSetting.notifications &&
                  !lastMsg.seenBy.includes(userId)
                ) {
                  count++;
                }
            }
        setNumMessages(count);
    }, [conversations, userId]);
    
    const getUserId = async () => {
        const currentId = await AsyncStorage.getItem('userId');
        setUserId(currentId);
    }

    const getNumMessages = async () => {
        
        if (!userId) return;
        const conversationAPI = restClient.apiClient.service(`apis/conversations/user`);
        const result = await conversationAPI.get(userId);
        if (result.success) {
          const conversations: Conversation[] = result.data;
          let unreadCount = 0;
          setConversations(result.data);
          
          for (const conv of conversations) {
            const lastMsg = conv.lastMessage;
            if (!lastMsg) continue;
          
            const userSetting = conv.settings.find(s => s.userId === userId);
            if (
              userSetting &&
              userSetting.active &&
              userSetting.notifications &&
              !lastMsg.seenBy.includes(userId)
            ) {
              unreadCount++;
            }
          }
    
          setNumMessages(unreadCount);
        }
    };
    
    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.buttonIcon, borderIcon&&styles.borderIcon]} onPress={onPressLeft}>
                <Icon name={IconLeft} size={24} color={Color.white_contrast} />
            </TouchableOpacity>
            <Text style={styles.label}>{label}</Text>
            {(IconRight || textRight) ? <TouchableOpacity style={[styles.buttonIcon, borderIcon&&styles.borderIcon]} onPress={onPressRight}>
                {IconRight && <Icon name={IconRight} size={24} color={Color.mainColor1} />}
                {textRight && <Text style={styles.textIcon}>{textRight}</Text>}
                {numMessages !== 0 && <View style={styles.messages}>
                    <Text style={styles.textMessages}>{numMessages}</Text>
                </View>}
            </TouchableOpacity> : <View style={styles.placeHolder}/>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '5%'
    },
    buttonIcon: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    textIcon: {
        paddingHorizontal: 5,
        color: Color.mainColor1
    },
    borderIcon: {
        borderWidth: 0.5,
        borderRadius: 50,
        borderColor: Color.textColor3
    },
    placeHolder: {
        width: 20
    },
    messages: {
        width: 12, height: 12,
        backgroundColor: 'red',
        borderRadius: 6,
        position:'absolute',
        top: 0, right: 0,
        justifyContent: 'center', alignItems: 'center',
    },
    textMessages: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold'
    }
})

export default CHeaderIcon;
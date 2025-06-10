// src/shared/components/header/CHeaderIcon.tsx
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
    labelColor?: string;
    textColor?: string;
    iconColor?: string;
}

const CHeaderIcon = ({label, IconLeft, onPressLeft, IconRight, onPressRight, textRight, borderIcon, labelColor, textColor, iconColor}: HeaderMessagesProps) => {
    useTheme();
    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.buttonIcon, borderIcon && styles.borderIcon]} onPress={onPressLeft}>
                <Icon name={IconLeft} size={24} color={Color.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.label, { color: Color.mainColor2 }]}>{label}</Text>
            {(IconRight || textRight) ? (
                <TouchableOpacity style={[styles.buttonIcon, borderIcon && styles.borderIcon]} onPress={onPressRight}>
                    {IconRight && <Icon name={IconRight} size={24} color={Color.mainColor2} />}
                    {textRight && <Text style={[styles.textIcon, { color: Color.mainColor2 }]}>{textRight}</Text>}
                </TouchableOpacity>
            ) : (
                <View style={styles.placeHolder}/>
            )}
        </View>
    );
}

export const CHeaderIconNewFeed = ({label, IconLeft, onPressLeft, IconRight, onPressRight, textRight, borderIcon}: HeaderMessagesProps) => {
    const [numMessages, setNumMessages] = useState<number>(0);
    const [userId, setUserId] = useState<string|null>(null);
    const [conversations, setConversations] = useState<Conversation[] | null>(null);

    useTheme();

    useEffect(() => {
        getUserId();
    },[]);

    useEffect(() => {
        if (userId) {
            getNumMessages();
        }
    }, [userId]);


    useEffect(() => {
        if (conversations && userId){
            conversations.forEach((conver) => {
                socket.emit("joinChat", conver._id);

                const handleNewMessage = (newMessage: any) => {
                    setConversations((prevConversations) => {
                        if (!prevConversations) return null;

                        return prevConversations.map((conversation) =>
                            conversation._id === newMessage.conversationId
                                ? { ...conversation, lastMessage: newMessage }
                                : conversation
                        );
                    });
                };

                socket.on("newMessage", handleNewMessage);

                return () => {
                    socket.emit("leaveChat", conver._id);
                    socket.off("newMessage", handleNewMessage);
                };
            });
        }
    }, [conversations, userId]);


    useEffect(() => {
        let count = 0;
        if (conversations && userId) {
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
        }
        setNumMessages(count);
    }, [conversations, userId]);

    const getUserId = async () => {
        const currentId = await AsyncStorage.getItem('userId');
        setUserId(currentId);
    }

    const getNumMessages = async () => {
        if (!userId) return;
        try {
            const conversationAPI = restClient.apiClient.service(`apis/conversations/user`);
            const result = await conversationAPI.get(userId);
            if (result.success) {
                const fetchedConversations: Conversation[] = result.data;
                setConversations(fetchedConversations);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.buttonIcon, borderIcon && styles.borderIcon]} onPress={onPressLeft}>
                <Icon name={IconLeft} size={24} color={Color.mainColor2} />
            </TouchableOpacity>
            <Text style={[styles.label, { color: Color.mainColor2 }]}>{label}</Text>
            {(IconRight || textRight) ? (
                <TouchableOpacity style={[styles.buttonIcon, borderIcon && styles.borderIcon]} onPress={onPressRight}>
                    {IconRight && <Icon name={IconRight} size={24} color={Color.mainColor2} />}
                    {textRight && <Text style={[styles.textIcon, { color: Color.mainColor2 }]}>{textRight}</Text>}
                    {numMessages !== 0 && (
                        <View style={[styles.messages, { backgroundColor: Color.error }]}>
                            <Text style={[styles.textMessages, { color: Color.textOnMain2 }]}>{numMessages}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ) : (
                <View style={styles.placeHolder}/>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: 40,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '5%',
        height: 55,
    },
    buttonIcon: {
        padding: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 25,
        fontWeight: 'bold',
        flexShrink: 1,
        textAlign: 'center',
    },
    textIcon: {
        paddingHorizontal: 5,
        fontSize: 16,
    },
    borderIcon: {
        borderWidth: 0.5,
        borderRadius: 50,
        borderColor: Color.border,
    },
    placeHolder: {
        width: 20,
    },
    messages: {
        width: 20,
        height: 20,
        borderRadius: 10,
        position:'absolute',
        top: -5,
        right: -5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textMessages: {
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default CHeaderIcon;
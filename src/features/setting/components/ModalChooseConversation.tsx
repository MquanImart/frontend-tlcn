import { Conversation } from "@/src/interface/interface_flex";
import { MyPhoto } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import getColor from "@/src/styles/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Modal, TouchableOpacity, View, Text, FlatList, Button, StyleSheet, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Color = getColor();

const ModalChooseConversation = ({ visible, onCancel }: {
    visible: boolean;
    onCancel: () => void;
  }) => {
    const { 
        getuserId,
        toggleConversation,
        conversations,
        selectedConversations,
        handleConfirm,
        getInfoUser
     } = useModal();

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getuserId();
            }
            load();
        }, [])
    );
    
    const handleSubmit = () => {
        handleConfirm();
        onCancel();
    }
    const renderConversationItem = ({ item }: { item: Conversation }) => {
        const isSelected = selectedConversations.includes(item._id);
        const user = getInfoUser(item);
        return (
            <TouchableOpacity style={styles.containerCard}
                onPress={() => toggleConversation(item._id)}
            >
                {user && <View style={styles.boxContent}>
                    <Image source={user.avt ? {uri: user.avt.url} : ( user.type === 'group'? 
                        require('@/src/assets/images/default/default_group_message.png'):
                        require('@/src/assets/images/default/default_user.png'))} 
                        style={styles.images}
                    />
                    <Text style={styles.text}>{user?.name}</Text>
                </View>}
                <View >
                    <Icon 
                        name={isSelected? "radio-button-on": "radio-button-off"} 
                        size={24} color={Color.white_contrast} 
                    />    
                </View>
            </TouchableOpacity>
        );
    };
    
    return (
        <Modal
          visible={visible}
          transparent={true}
          animationType="slide"
          onRequestClose={onCancel}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Chọn cuộc trò chuyện</Text>
              {conversations && conversations.length > 0 ? (
                <FlatList
                  data={conversations.filter((conversation) => conversation.type !== 'page')}
                  renderItem={renderConversationItem}
                  keyExtractor={(item) => item._id}
                  style={styles.list}
                />
              ) : (
                <Text style={styles.noData}>Không có cuộc trò chuyện nào</Text>
              )}
              <View style={styles.buttonContainer}>
                <Button title="Hủy" onPress={onCancel} color="#ff4444" />
                <Button
                  title="Xác nhận"
                  onPress={handleSubmit}
                  disabled={selectedConversations.length === 0}
                />
              </View>
            </View>
          </View>
        </Modal>
      );
};

interface InfoUser {
    conversationId: string;
    name: string;
    avt: MyPhoto | null;
    type: 'group' | 'private'
}

const useModal = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[] | null>(null);
    const [selectedConversations, setSelectedConversations] = useState<string[]>([]);

    useEffect(() => {
        getConversations();
        getAllSos();
    },[userId]);

    const getuserId = async () => {
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
    }

    const getConversations = async () => {
        if (!userId) return;
        const conversationAPI = restClient.apiClient.service(`apis/conversations/user`);
        const result = await conversationAPI.get(userId);
        if (result.success){
            setConversations(result.data);
        }
    }

    const getAllSos = async () => {
        if (!userId) return;
        const conversationAPI = restClient.apiClient.service(`apis/conversations/sos`);
        const result = await conversationAPI.get(userId);
        if (result.success){
            setSelectedConversations(result.data.map((item: Conversation) => item._id));
        }
    }

    const ChangeSos = async () => {
        if (!userId) return;
        const conversationAPI = restClient.apiClient.service(`apis/conversations/sos`);
        const result = await conversationAPI.patch(userId, {conversationsId: selectedConversations});
        if (result.success){
            setSelectedConversations(result.data.map((item: Conversation) => item._id));
        }
    }

    const getOtherParticipantById = (conversation: Conversation, userId: string): {_id: string; displayName: string; avt: MyPhoto[]} | null => {
        return conversation.participants.find(user => user._id !== userId) || null;
    };

    const getShortNames = (conversation: Conversation): string => {
        return conversation.participants
            .map(user => user.displayName.split(" ").pop())
            .filter(Boolean)
            .join(", ");
    };

    const getInfoUser = (item: Conversation) : InfoUser | null => {
        if (!userId) return null;
        if (item.type === "private"){
            const userData = getOtherParticipantById(item, userId);
            return {
                conversationId: item._id,
                name: userData?userData.displayName:"Người dùng không xác định",
                avt: userData && userData.avt.length > 0 ? userData.avt[userData.avt.length - 1] : null,
                type: 'group'
            }
        } else if (item.type === "group"){
            return {
                conversationId: item._id,
                name: item.groupName !== null? item.groupName : getShortNames(item),
                avt: item.avtGroup !== null? item.avtGroup : null,
                type: 'private'
            }
        } return null;
    }

    const handleConfirm = () => {
        ChangeSos();
    };

    const toggleConversation = (conversationId: string) => {
        setSelectedConversations((prev) =>
          prev.includes(conversationId)
            ? prev.filter((id) => id !== conversationId)
            : [...prev, conversationId]
        );
    };

    return {
        selectedConversations, 
        conversations,
        toggleConversation,
        getuserId,
        handleConfirm,
        getInfoUser
    }
}

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    list: {
      maxHeight: 300,
    },
    noData: {
      textAlign: 'center',
      color: '#666',
      marginVertical: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    containerCard: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10
    },
    boxContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    images: {
        width: 50, height: 50,
        borderRadius: 50
    },
    text: {
        paddingHorizontal: 20
    }
});

export default ModalChooseConversation;
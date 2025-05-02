import { View, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Keyboard, Text, FlatList, ActivityIndicator } from "react-native"
import HeaderBoxChat from "../../components/HeaderBoxChat";
import getColor from "@/src/styles/Color";
import CIconButton from "@/src/shared/components/button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import InputText from "../../components/InputText";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import useConversations from "./useConversations";
import { useCallback, useEffect } from "react";
import React from "react";
import { Message } from "@/src/interface/interface_flex";
import { MessageReceive, MessageSend } from "./Message";

const Color = getColor();


const Conversations = () => {
  const route = useRoute<RouteProp<ChatStackParamList, "BoxChat">>();
  const { conversationId, friend } = route.params || {};
  const { 
    getNameChat, navigation,
    getConversation, getMessages,
    messages, conversation,
    loadMoreMessages,
    loadingMore, currUser,
    handleOpenImagePicker,
    createMessage, text, setText,
    navigationDetails
  } = useConversations(conversationId, friend);

  useFocusEffect(
      useCallback(() => {
        getConversation();
        getMessages();
      }, [])
  );

  const getUIMessage = (message: Message, index: number) => {
    if (conversation && messages){
      let showAvatar;
      if (index === messages?.length - 1) {
        showAvatar = true;
      } else {
        const prevMessage = messages?.[index + 1]; // Lấy tin nhắn trước đó
        showAvatar = !prevMessage || prevMessage.sender !== message.sender; // Hiển thị avatar nếu tin nhắn trước đó khác sende
      }

      const user = conversation.participants.filter((item) => item._id === message.sender);
      
      if (user.length < 0)
        return <View/>
      if (message.sender === currUser) {
          return <MessageSend user={user[0]} message={message}  showAvatar={showAvatar} 
          />;
      } else {
          return <MessageReceive user={user[0]} message={message} showAvatar={showAvatar} 
          />;
      }
    } else {
       return <ActivityIndicator size="small" color="gray" />
    }
  };

  // if (!conversation || !messages) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

        <View style={styles.container}>
            <HeaderBoxChat name={getNameChat()} 
              onPressIconLeft={() => {navigation.goBack()}} 
              onPressIconRight={navigationDetails}/>
            <View style={styles.boxChat}>
            <View style={styles.boxContent}>
              <FlatList
                style={styles.boxMessage}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => {
                  return (
                    <View key={item._id}>
                      {getUIMessage(item, index)}
                    </View>
                  );
                }}
                inverted // Đảo ngược danh sách, tin mới nhất ở dưới
                onEndReached={loadMoreMessages} // Khi cuộn lên, tải thêm tin nhắn
                onEndReachedThreshold={0.2} // Khi cuộn gần 20% danh sách thì tải tiếp
                ListFooterComponent={
                  loadingMore ? <ActivityIndicator size="small" color="gray" /> : null
                }
              />
            </View>
            <View style={styles.boxInput}>
                <CIconButton icon={<Icon name={"camera-alt"} size={20} color={Color.white_homologous} />} 
                    onSubmit={handleOpenImagePicker} 
                    style={{
                    width: 40, height: 40,
                    backColor: Color.mainColor1,
                    radius: 50,
                }}/>
                <InputText text={text} setText={setText}/>
                <CIconButton icon={<Icon name={"send"} size={20} color={Color.white_homologous} />} 
                    onSubmit={() => {createMessage('text', null)}} 
                    style={{
                    width: 40, height: 40,
                    backColor: Color.mainColor1,
                    radius: 50,
                }}/>
            </View>
          </View>
        </View>
    </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround,
        paddingTop: 20
    },
    boxChat: {
        width: '100%',
        height: '92%',
    },
    boxContent: {
        width: '100%',
        height: '85%', 
        padding: 5,
        backgroundColor: Color.backGround2,
    },
    boxMessage: {
      width: '100%',
    },
    boxInput: {
        width: '100%',
        height: 80,
        paddingHorizontal: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})

export default Conversations;

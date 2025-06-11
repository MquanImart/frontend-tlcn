import { View, StyleSheet, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from "react-native";
import HeaderBoxChat from "../../components/HeaderBoxChat";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CIconButton from "@/src/shared/components/button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import InputText from "../../components/InputText";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import useConversations from "./useConversations";
import { Message } from "@/src/interface/interface_flex";
import { MessageReceive, MessageSend } from "./Message";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Conversations = () => {
  useTheme();
  const route = useRoute<RouteProp<ChatStackParamList, "BoxChat">>();
  const { conversationId, isFriend, friend } = route.params || {};
  
  const insets = useSafeAreaInsets();

  const {
    getNameChat, navigation,
    getConversation, getMessages,
    messages, conversation,
    loadMoreMessages,
    loadingMore, userId,
    handleOpenImagePicker,
    createMessage, text, setText,
    navigationDetails,
    sending
  } = useConversations(conversationId, isFriend, friend);

  useFocusEffect(
      useCallback(() => {
        const load = async () => {
            await getConversation();
            await getMessages();
          }
          load();
      }, [userId])
  );

  const getUIMessage = (message: Message, index: number) => {
    if (conversation && messages && userId){
      let showAvatar;
      if (index === messages.length - 1) {
        showAvatar = true;
      } else {
        const nextMessage = messages?.[index + 1];
        showAvatar = !nextMessage || nextMessage.sender !== message.sender;
      }

      const user = conversation.participants.find((item) => item._id === message.sender);

      if (!user)
        return <View/>
      if (message.sender === userId) {
          return <MessageSend user={user} message={message}  showAvatar={showAvatar}
          />;
      } else {
          return <MessageReceive user={user} message={message} showAvatar={showAvatar}
          />;
      }
    } else {
       return <ActivityIndicator size="small" color={Color.mainColor2} />
    }
  };

    if (isFriend && (!conversation || !messages)) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.background}}><ActivityIndicator size="large" color={Color.mainColor2} /></View>;

    return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: Color.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >

        <HeaderBoxChat name={getNameChat()}
          onPressIconLeft={() => {navigation.goBack()}}
          onPressIconRight={navigationDetails}/>
        <View style={[styles.boxChat, { backgroundColor: Color.background }]}>
            <View style={[styles.boxContent, { backgroundColor: Color.backgroundSecondary }]}>
              <FlatList
                style={styles.boxMessage}
                contentContainerStyle={{ paddingVertical: 10 }}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => {
                  return getUIMessage(item, index);
                }}
                inverted
                onEndReached={loadMoreMessages}
                onEndReachedThreshold={0.2}
                ListFooterComponent={
                  loadingMore ? <ActivityIndicator size="small" color={Color.mainColor2} style={{ marginVertical: 10 }} /> : null
                }
                ListHeaderComponent={
                    sending ? <ActivityIndicator size="small" color={Color.mainColor2} style={{ marginVertical: 10 }} /> : null
                }
              />
            </View>
            {sending?(
              <View style={[styles.boxInput, {justifyContent: 'center', alignItems: 'center', backgroundColor: Color.background, paddingBottom: insets.bottom + 10}]}><ActivityIndicator size="small" color={Color.mainColor2}/></View>
            ):(
              <View style={[styles.boxInput, { backgroundColor: Color.background }]}>
                <CIconButton icon={<Icon name={"camera-alt"} size={20} color={Color.textOnMain2} />}
                    onSubmit={handleOpenImagePicker}
                    style={{
                    width: 40, height: 40,
                    backColor: Color.mainColor2,
                    radius: 50,
                }}/>
                <InputText text={text} setText={setText}/>
                <CIconButton icon={<Icon name={"send"} size={20} color={Color.textOnMain2} />}
                    onSubmit={() => {createMessage('text', null)}}
                    style={{
                    width: 40, height: 40,
                    backColor: Color.mainColor2,
                    radius: 50,
                }}/>
            </View>
            )}
          </View>
    </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    boxChat: {
        flex: 1,
    },
    boxContent: {
        flex: 1,
        paddingHorizontal: 5,
    },
    boxMessage: {
      flex: 1,
      width: '100%',
    },
    boxInput: {
        width: '100%',
        height: 80,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
});

export default Conversations;
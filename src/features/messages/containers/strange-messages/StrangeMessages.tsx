import { View, StyleSheet, ActivityIndicator, Text } from "react-native"
import getColor from "@/src/styles/Color";
import SearchMessages from "../../components/SearchMessages";
import { FlatList } from "react-native-gesture-handler";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useStrangeMessage from "./useStrangeMessage";
import CardSearch from "../../components/CardSearch";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import CardStrangeMessage from "../../components/CardStrangeMessage";

const Color = getColor();

const StrangeMessages = () => {

    const { 
      search, searchUser, 
      isSearch, setIsSearch,
      conversations, inputRef,
      onPressHeaderLeft, filterUser,
      getConversations, chatnavigation,
      getUserId, userId
    } = useStrangeMessage();
    
    useFocusEffect(
        useCallback(() => {
          getUserId()
        }, [])
    );
    
    useEffect(()=> {
      if (userId){
        getConversations();
      }
    },[userId]);

    return (
        <View style={styles.container}>
            <CHeaderIcon label={"Tin nhắn từ người lạ"} 
            IconLeft={isSearch?"arrow-back-ios":"menu"}  onPressLeft={onPressHeaderLeft} 
            />
            <View style={styles.padding}/>
            <SearchMessages search={search} setSearch={searchUser} 
                setIsSearch={setIsSearch} refInput={inputRef}
            />
            <Text style={styles.textNote}>Đoạn chat dành cho những người dùng chưa phải bạn bè của bạn. Hãy kết bạn hoặc cùng tham gia vào một nhóm để nhìn thấy đoạn chat trên tin nhắn.</Text>
            {!conversations? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
              ) : !isSearch? (
                <FlatList style={styles.listMessages} data={conversations} renderItem={({item}) => 
                  <CardStrangeMessage 
                    conversation={item} onPress={() => chatnavigation.navigate("BoxChat", {conversationId: item._id})}                  
                  />}
                /> 
              ) : filterUser? (
                <FlatList style={styles.listMessages} data={filterUser} renderItem={({item}) => 
                  <CardSearch cardData={item}/>}
                /> 
              ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
              )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround,
    },
    padding: {
        paddingVertical: 5
    },
    boxContent: {
        width: '90%',
        alignSelf: 'center',
        paddingVertical: 10,
    },
    textNote: {
        fontSize: 13,
        color: '#333',
        textAlign: 'justify',
        lineHeight: 20,
        paddingHorizontal: 20
    },
    listMessages: {
        marginVertical: 10,
        minHeight: '70%',
        maxHeight: '75%',
    }
})


export default StrangeMessages;
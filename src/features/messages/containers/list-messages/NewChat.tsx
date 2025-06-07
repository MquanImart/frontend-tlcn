import { View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from "react-native"
import SearchMessages from "../../components/SearchMessages";
import Icon from "react-native-vector-icons/MaterialIcons";
import getColor from "@/src/styles/Color";
import CardUser from "../../components/CardUser";
import { FlatList } from "react-native-gesture-handler";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useNewChat from "./useNewChat";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

const Color = getColor();

const NewChat = () => {
    
  const {
    dismissKeyboard, goBack,
    inputRef, filterUser,
    search, searchUser,
    setIsSearch, navigateNewGroupChat,
    getUserWithoutChat, createNewChat
  } = useNewChat();

  useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getUserWithoutChat();
            }
            load(); 
        }, [])
    );
    
    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
            <CHeaderIcon 
                label={"Tin nhắn mới"} 
                IconLeft={"arrow-back-ios"} 
                onPressLeft={goBack}
            />
            <SearchMessages
              refInput={inputRef}
              search={search}
              setSearch={searchUser}
              setIsSearch={setIsSearch}
            />
            <TouchableOpacity style={styles.boxNewGroup} onPress={navigateNewGroupChat}>
                <Text style={styles.textNewGroup}>Tạo nhóm mới</Text>
                <Icon name={"arrow-forward-ios"} size={24} color={Color.white_contrast} />
            </TouchableOpacity>
            <View style={styles.boxUser}>
                <Text style={styles.textNewGroup}>Gợi ý</Text>
                <FlatList data={filterUser} renderItem={({item}) => 
                    <CardUser avt={item.avt.length > 0? item.avt[item.avt.length - 1] : null} 
                      name={item.displayName} onPress={() => {createNewChat(item)}} 
                      _id={item._id} radio={false}
                    />
                }/>
            </View>
        </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround
    },
    boxNewGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20
    },
    textNewGroup: {
        fontSize: 18 
    },
    boxUser: {
        paddingHorizontal: 20,
        maxHeight: '78%'
    }
})

export default NewChat;
import { View, StyleSheet, TouchableWithoutFeedback, Text, TouchableOpacity } from "react-native"
import SearchMessages from "../../components/SearchMessages";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CardUser from "../../components/CardUser";
import { FlatList } from "react-native-gesture-handler";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useNewChat from "./useNewChat";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

const NewChat = () => {
    useTheme();
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
        <View style={[styles.container, { backgroundColor: Color.background }]}>
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
                <Text style={[styles.textNewGroup, { color: Color.textPrimary }]}>Tạo nhóm mới</Text>
                <Icon name={"arrow-forward-ios"} size={24} color={Color.textPrimary} />
            </TouchableOpacity>
            <View style={styles.boxUser}>
                <Text style={[styles.textNewGroup, { color: Color.textPrimary }]}>Gợi ý</Text>
                <FlatList
                    data={filterUser}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({item}) =>
                    <CardUser
                        avt={item.avt.length > 0? item.avt[item.avt.length - 1] : null}
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
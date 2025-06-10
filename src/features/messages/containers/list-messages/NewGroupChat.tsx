import { View, StyleSheet, TouchableWithoutFeedback, Text } from "react-native"
import SearchMessages from "../../components/SearchMessages";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CardUser from "../../components/CardUser";
import { FlatList } from "react-native-gesture-handler";
import InputName from "../../components/InputName";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useNewGroupChat from "./useNewGroupChat";
import { useCallback } from "react";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";

const NewGroupChat = () => {
    useTheme();
    const route = useRoute<RouteProp<ChatStackParamList, "NewGroupChat">>();
    const { defaultChoose } = route.params || {};
    const {
      dismissKeyboard, goBack,
      search, searchUser, inputRef,
      setName, setIsSearch, name,
      isSearch, selected, filterUser,
      handleSelected, getUserWithoutChat,
      createGroup
    } = useNewGroupChat(defaultChoose);

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
                label={"Nhóm mới"}
                IconLeft={"arrow-back-ios"}
                onPressLeft={goBack}
                textRight="Tạo"
                onPressRight={createGroup}
            />
            <InputName
              refInput={inputRef}
              name={name}
              setName={setName}
            />
            <SearchMessages
              refInput={inputRef}
              search={search}
              setSearch={searchUser}
              setIsSearch={setIsSearch}
            />
            {!isSearch && selected.length > 0 && <View style={styles.boxMember}>
                <Text style={[styles.textNewGroup, { color: Color.textPrimary }]}>Đã chọn</Text>
                <FlatList
                    data={selected}
                    keyExtractor={(item) => item._id.toString()} // Added keyExtractor
                    renderItem={({item}) =>
                    <CardUser
                        _id={item._id}
                        avt={item.avt.length > 0? item.avt[item.avt.length - 1] : null}
                        name={item.displayName}
                        onPress={() => {handleSelected(item._id)}}
                        icon={"highlight-off"}
                        radio={true}
                    />
                }/>
            </View>}
            <View style={[styles.boxUser, {height: 590 - selected.length*70 - (selected.length>0?40:0)}]}>
                <Text style={[styles.textNewGroup, { color: Color.textPrimary }]}>Gợi ý</Text>
                <FlatList
                    data={filterUser}
                    keyExtractor={(item) => item._id.toString()} // Added keyExtractor
                    renderItem={({item}) =>
                    <CardUser
                        _id={item._id}
                        avt={item.avt.length > 0? item.avt[item.avt.length - 1] : null}
                        name={item.displayName}
                        selected={selected.some((user) => user._id === item._id)}
                        onPress={() => {handleSelected(item._id)}}
                        radio={true}
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
        fontSize: 18,
        marginVertical: 10
    },
    boxUser: {
        paddingHorizontal: 20,
    },
    boxMember: {
        width: '100%',
        paddingHorizontal: 20,
        maxHeight: '30%'
    }
})

export default NewGroupChat;
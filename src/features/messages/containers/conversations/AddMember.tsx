import { View, StyleSheet, TouchableWithoutFeedback, Text } from "react-native"
import SearchMessages from "../../components/SearchMessages";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CardUser from "../../components/CardUser";
import { FlatList } from "react-native-gesture-handler";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { useCallback } from "react";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import useNewGroupChat from "../list-messages/useNewGroupChat";

const AddMember = () => {
    useTheme();
    const route = useRoute<RouteProp<ChatStackParamList, "AddMember">>();
    const { conversationId, defaultChoose } = route.params || {};
    const {
      dismissKeyboard, goBack,
      search, searchUser, inputRef, setIsSearch,
      isSearch, selected, filterUser,
      handleSelected, getUserWithoutChat,
      addMemberGroup
    } = useNewGroupChat(defaultChoose);

    useFocusEffect(
        useCallback(() => {
          const load = async () => {
            await getUserWithoutChat();
          }
          load();
        }, [])
    );

    const handleAddMember = () => {
        addMemberGroup(conversationId)
    }
    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <CHeaderIcon
                label={"Thêm thành viên"}
                IconLeft={"arrow-back-ios"}
                onPressLeft={goBack}
                textRight="Thêm"
                onPressRight={handleAddMember}
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
                  keyExtractor={(item) => item._id.toString()}
                  renderItem={({ item }) => {
                    const isDefault = defaultChoose ? defaultChoose.some(
                      (id) => id._id.toString() === item._id.toString()
                    ) : true;

                    return (
                      <CardUser
                        _id={item._id}
                        avt={item.avt.length > 0 ? item.avt[item.avt.length - 1] : null}
                        name={item.displayName}
                        onPress={() => handleSelected(item._id)}
                        icon={"highlight-off"}
                        radio={!isDefault}
                      />
                    );
                  }}
                />

            </View>}
            <View style={[styles.boxUser, {height: 590 - selected.length*70 - (selected.length>0?40:0)}]}>
                <Text style={[styles.textNewGroup, { color: Color.textPrimary }]}>Gợi ý</Text>
                <FlatList
                    data={filterUser ? filterUser.filter(
                      (user) => defaultChoose ? !defaultChoose.some(
                        (id) => id._id.toString() === user._id.toString()
                      ) : true
                    ) : []}
                    renderItem={({item}) =>
                    <CardUser
                        _id={item._id}
                        avt={item.avt.length > 0 ? item.avt[item.avt.length - 1] : null}
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

export default AddMember;
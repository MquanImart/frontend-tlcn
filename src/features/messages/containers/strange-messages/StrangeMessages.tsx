import { View, StyleSheet, ActivityIndicator, Text } from "react-native"
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import SearchMessages from "../../components/SearchMessages";
import { FlatList } from "react-native-gesture-handler";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useStrangeMessage from "./useStrangeMessage";
import CardSearch from "../../components/CardSearch";
import { useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import CardStrangeMessage from "../../components/CardStrangeMessage";

const StrangeMessages = () => {
    useTheme();
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
          const load = async () => {
                await getUserId();
            }
            load();
        }, [])
    );

    useEffect(()=> {
      if (userId){
        getConversations();
      }
    },[userId]);

    return (
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <CHeaderIcon label={"Tin nhắn từ người lạ"}
            IconLeft={isSearch?"arrow-back-ios":"menu"}  onPressLeft={onPressHeaderLeft}
            />
            <View style={styles.padding}/>
            <SearchMessages search={search} setSearch={searchUser}
                setIsSearch={setIsSearch} refInput={inputRef}
            />
            <Text style={[styles.textNote, { color: Color.textSecondary }]}>
                Đoạn chat dành cho những người dùng chưa phải bạn bè của bạn. Hãy kết bạn hoặc cùng tham gia vào một nhóm để nhìn thấy đoạn chat trên tin nhắn.
            </Text>
            {!conversations ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
              ) : !isSearch ? (
                <FlatList
                    style={styles.listMessages}
                    data={conversations}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({item}) =>
                        <CardStrangeMessage
                            conversation={item} onPress={() => chatnavigation.navigate("BoxChat", {conversationId: item._id})}
                        />
                    }
                />
              ) : filterUser ? (
                <FlatList
                    style={styles.listMessages}
                    data={filterUser}
                    renderItem={({item}) =>
                        <CardSearch cardData={item}/>
                    }
                />
              ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
              )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
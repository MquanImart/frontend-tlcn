import { View, StyleSheet, Animated, ActivityIndicator, Text } from "react-native"; // Import Text component
import Tabbar from "@/src/shared/components/tabbar/Tabbar";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import SearchMessages from "../../components/SearchMessages";
import CardMessages from "../../components/CardMessages";
import { FlatList } from "react-native-gesture-handler";

import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { useCallback, useEffect } from "react";
import useListMessages from "./useListMessages";
import CardSearch from "../../components/CardSearch";
import { useFocusEffect } from "@react-navigation/native";

const Messages = () => {
  useTheme();
  const { inputRef,
    search, searchUser,
    isSearch, setIsSearch,
    conversations, getConversations,
    onPressHeaderLeft, navigateNewChat,
    filterUser, userId, getuserId
  } = useListMessages();

  const { tabbarPosition, handleScroll} = useScrollTabbar();

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await getuserId(); // lấy lại userId nếu cần
        await getConversations(); // luôn gọi lại conversations khi focus
      };
      load();
    }, [])
  );

  useEffect(()=> {
    if (userId){
      getConversations();
    }
  },[userId]);

  return (
      <View style={{flex: 1, backgroundColor: Color.background}}>
          <View style={styles.container} >
              <CHeaderIcon label={"Tin nhắn"}
                  IconLeft={isSearch?"arrow-back-ios":"menu"}  onPressLeft={onPressHeaderLeft}
                  IconRight={"add"} onPressRight={navigateNewChat}
              />
              <SearchMessages search={search} setSearch={searchUser} setIsSearch={setIsSearch} refInput={inputRef}/>
              {!conversations? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
              ) : !isSearch? (
                <FlatList style={styles.listMessages} onScroll={handleScroll} data={conversations} renderItem={({item}) =>
                  <CardMessages
                    conversation={item} isFriend={true}
                  />}
                  keyExtractor={(item) => item._id.toString()}
                />
              ) : filterUser? (
                <FlatList style={styles.listMessages} onScroll={handleScroll} data={filterUser} renderItem={({item}) =>
                  <CardSearch cardData={item}/>}
                />
              ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
              )}
          </View>
          <Animated.View style={[styles.tabbar,
            {
              transform: [{ translateY: tabbarPosition }],
              position: 'absolute', bottom: 0,
            },
          ]}>
              <Tabbar/>
          </Animated.View>
      </View>
  )
}

const styles = StyleSheet.create({
    container: {
      width: '100%', height: "100%"
    },
    tabbar: {
        width: '100%',
    },
    listMessages: {
        width: '95%', maxHeight: '80%',
        alignSelf: 'center'
    }
})

export default Messages;
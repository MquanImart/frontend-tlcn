import { View, StyleSheet, Animated, ActivityIndicator, Text } from "react-native";
import Tabbar from "@/src/shared/components/tabbar/Tabbar";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import SearchMessages from "../../components/SearchMessages";
import CardMessages from "../../components/CardMessages";
import { FlatList } from "react-native-gesture-handler";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { useCallback, useEffect } from "react";
import CardSearch from "../../components/CardSearch";
import { useFocusEffect } from "@react-navigation/native";
import usePageMessages from "./usePageMessages";

const PageMessages = () => {
  useTheme(); // Ensures the Color object is updated based on the current theme
  const { inputRef,
    search, searchUser,
    isSearch, setIsSearch,
    conversations, getConversations,
    onPressHeaderLeft,
    filterUser, userId, getuserId
  } = usePageMessages();

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
              <CHeaderIcon label={"Tin nhắn Trang"}
                  IconLeft={isSearch?"arrow-back-ios":"menu"}  onPressLeft={onPressHeaderLeft}
              />
              <SearchMessages search={search} setSearch={searchUser} setIsSearch={setIsSearch} refInput={inputRef}/>
              {!conversations ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                </View>
              ) : !isSearch ? (
                <FlatList
                    style={styles.listMessages}
                    onScroll={handleScroll}
                    data={conversations}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({item}) =>
                        <CardMessages
                            conversation={item}
                        />
                    }
                />
              ) : filterUser ? (
                <FlatList
                    style={styles.listMessages}
                    onScroll={handleScroll}
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
          <Animated.View style={[styles.tabbar,
            {
              transform: [{ translateY: tabbarPosition }],
              position: 'absolute', bottom: 0,
            },
          ]}>
              <Tabbar/>
          </Animated.View>
      </View>
  );
};

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
});

export default PageMessages;
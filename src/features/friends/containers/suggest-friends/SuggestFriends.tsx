import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FriendCard from "../../components/FriendCard";
import { ButtonActions } from "../../components/ActionsCard";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import useSuggestFriends from "./useSuggestFriends";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import MessageModal from "../../../../shared/components/form-message-addfriend/AddMessages";

interface SuggestFriendsProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const SuggestFriends = ({handleScroll} : SuggestFriendsProps) => {
    useTheme();
    const { filterFriends, getAllFriends, addFriends, deleteFriends,
        isAddFriends, onCloseModel, onOpenModel, selectedFriends,
        handleLoadMore, skip,
     } = useSuggestFriends();

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getAllFriends(skip);
            }
            load();
        }, [])
    );
    

    const HandleButton = (_id: string) => {
        return ButtonActions({label: ["Kết bạn", "Xóa"], actions: [() => {onOpenModel(_id)}, () => {deleteFriends(_id)}]})
    }

    const onSend = (value: string) => {
        addFriends(selectedFriends, value); 
        onCloseModel();
    }

    if (!filterFriends) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>Gợi ý cho bạn</Text>
            </View>
            <FlatList onScroll={handleScroll} style={styles.listCard} data={filterFriends} renderItem={({item})=>
                <View style={styles.boxCard}>
                <FriendCard key={item.friend._id} _id={item.friend._id} 
                    name={item.friend.displayName} 
                    img={item.friend.avt} 
                    sameFriends={item.count}
                    aboutMe={item.friend.aboutMe?item.friend.aboutMe: ""}
                    button={() => {return HandleButton(item.friend._id)}}
                />
                </View>
            }/>
            <TouchableOpacity style={styles.boxMore} onPress={handleLoadMore}>  
                <Text style={styles.textMore}>Gợi ý thêm</Text>
            </TouchableOpacity>
            <MessageModal visible={isAddFriends} onClose={onCloseModel} onSend={onSend}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '80%'
    },
    boxTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
    },
    label: {
        fontWeight: 'bold'
    },
    listCard: {
        paddingVertical: 10,
    },
    boxCard: {
        width: '90%',
        alignSelf: 'center'
    },
    boxMore: {
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: Color.mainColor2,
        borderRadius: 10,
        padding: 10,
        marginVertical: 25
    },
    textMore: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Color.white
    }
})

export default SuggestFriends;
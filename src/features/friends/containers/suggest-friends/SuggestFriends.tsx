import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import FriendCard from "../../components/FriendCard";
import { ButtonActions } from "../../components/ActionsCard";
import getColor from "@/src/styles/Color";
import useSuggestFriends from "./useSuggestFriends";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import MessageModal from "../../../../shared/components/form-message-addfriend/AddMessages";

const Color = getColor();

interface SuggestFriendsProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

const SuggestFriends = ({handleScroll} : SuggestFriendsProps) => {

    const { filterFriends, getAllFriends, addFriends, deleteFriends,
        isAddFriends, onCloseModel, onOpenModel, selectedFriends
     } = useSuggestFriends();

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getAllFriends();
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
    }
})

export default SuggestFriends;
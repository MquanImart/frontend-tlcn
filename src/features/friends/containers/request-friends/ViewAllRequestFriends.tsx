import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TouchableWithoutFeedback, Keyboard } from "react-native"
import FriendCard, { FriendCardProps } from "../../components/FriendCard";
import CSearch from "../../components/CSearch";
import CHeader from "@/src/shared/components/header/CHeader";
import { StackNavigationProp } from "@react-navigation/stack";
import { FriendsStackParamList } from "@/src/shared/routes/FriendsNavigation";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import useAllRequest from "./useAllRequest";
import { ButtonActions } from "../../components/ActionsCard";

type ViewAllRequestFriendsRouteProp = RouteProp<
  FriendsStackParamList,
  'ViewAllRequestFriends'
>;

type ViewAllRequestFriendsProps = {
  route: ViewAllRequestFriendsRouteProp;
};
  
type CollectionsNavigationProp = StackNavigationProp<FriendsStackParamList, "ViewAllRequestFriends">;

const ViewAllRequestFriends = ({ route }: ViewAllRequestFriendsProps) => {
    useTheme();
    const navigation = useNavigation<CollectionsNavigationProp>();
    const { isSendMe, data } = route.params;

    const { filterData, ReplyRequest, search, setSearch, handleSearch} = useAllRequest(data);

    const HandleButton = (isSendMe: boolean, _id: string) => {
        if (isSendMe) {
            return ButtonActions({actions: [() => {ReplyRequest(_id, "approved")}, () => {ReplyRequest(_id, "rejected")}], label: ["Chấp nhận", "Từ chối"]})
        } else {
            return ButtonActions({actions: [() => {ReplyRequest(_id, "rejected")}],label: ["thu hồi"]})
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
            <CHeader label={"Lời mời kết bạn"} backPress={()=>{navigation.goBack()}}/>
            <CSearch handleSearch={() => {handleSearch(search, isSendMe)}} handleChange={setSearch} text={search}/>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>{isSendMe?"Gửi đến tôi":"Lời mời của tôi"}</Text>
            </View>
            <FlatList style={styles.listCard} data={filterData} renderItem={({item})=>
                <View style={styles.boxCard}>
                <FriendCard 
                    key={item.addFriend._id} _id={item.addFriend._id} 
                    name={isSendMe?item.sender.displayName:item.receiver.displayName} 
                    img={isSendMe?item.sender.avt:item.receiver.avt} 
                    sameFriends={item.mutualFriends.length} 
                    sameGroups={item.mutualGroups.length}
                    sendDate={item.addFriend.createdAt} 
                    aboutMe={item.addFriend.message?item.addFriend.message:"Xin chào, rất vui được được kết bạn"}
                    button={() => { return HandleButton(isSendMe, item.addFriend._id)}}
                />
                </View>
            }/>
        </View>
        </TouchableWithoutFeedback>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.backGround,
        paddingBottom: 10
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


export default ViewAllRequestFriends;
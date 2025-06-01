import { View, StyleSheet, ActivityIndicator } from "react-native"
import PreviewRequest from "./PreviewRequest";
import { ScrollView } from "react-native-gesture-handler";
import { StackNavigationProp } from "@react-navigation/stack";
import { FriendsStackParamList } from "@/src/shared/routes/FriendsNavigation";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import useRequestFriends from "./useRequestFriends";
import { useCallback } from "react";

interface RequestFriendsProps {
    handleScroll: (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => void;
}

type CollectionsNavigationProp = StackNavigationProp<FriendsStackParamList, "Friends">;

const RequestFriends = ({handleScroll} : RequestFriendsProps) => {
    const navigation = useNavigation<CollectionsNavigationProp>();

    const { requestFriendsToMe, requestFriendsToOther, 
        getDataFriendsToMe, getDataFriendsToOther, ReplyRequest
    } = useRequestFriends();

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getDataFriendsToMe();
                await getDataFriendsToOther();
            }
            load();
        }, [])
    );
    
    if (!requestFriendsToMe || !requestFriendsToOther) 
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
        )
    return (
        <ScrollView style={styles.crollView} onScroll={handleScroll}
            showsVerticalScrollIndicator={false}
        >
            <PreviewRequest 
                label={"Gửi đến tôi"} 
                data={requestFriendsToMe}
                onPressViewAll={() => {navigation.navigate("ViewAllRequestFriends", {isSendMe: true, data: requestFriendsToMe})}}
                isSendMe={true}
                ReplyRequest = {ReplyRequest}
            />
            <PreviewRequest 
                label={"Lời mời của tôi"} 
                data={requestFriendsToOther}
                onPressViewAll={() => {navigation.navigate("ViewAllRequestFriends", {isSendMe: false, data: requestFriendsToOther})}}
                isSendMe={false}
                ReplyRequest = {ReplyRequest}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    crollView: {
        
    }
})

export default RequestFriends;
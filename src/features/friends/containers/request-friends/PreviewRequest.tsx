import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native"
import FriendCard from "../../components/FriendCard";
import { FriendCardData } from "./useRequestFriends";
import { ButtonActions } from "../../components/ActionsCard";


interface PreviewRequestProps {
    label: string;
    onPressViewAll: () => void;
    data: FriendCardData[];
    isSendMe: boolean;
    ReplyRequest: (id: string, status: "approved" | "rejected") => void;
}

const PreviewRequest = ({label, onPressViewAll, data, isSendMe, ReplyRequest}: PreviewRequestProps) => {
    useTheme();
    const HandleButton = (isSendMe: boolean, _id: string) => {
        if (isSendMe) {
            return ButtonActions({ label: ["Đồng ý", "Từ chối"],actions: [() => {ReplyRequest(_id, "approved")}, () => {ReplyRequest(_id, "rejected")}], _id: _id})
        } else {
            return ButtonActions({label:["Thu hồi"], actions: [() => {ReplyRequest(_id, "rejected")}], _id: _id})
        }
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.boxTitle}>
                <Text style={styles.label}>{label}</Text>
                <TouchableOpacity onPress={onPressViewAll}>
                    <Text style={styles.textViewAll}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.boxContent}>
            {data.slice(0, 3).map((item) => 
                <FriendCard 
                    key={item.addFriend._id} _id={isSendMe?item.sender._id:item.receiver._id} 
                    name={isSendMe?item.sender.displayName:item.receiver.displayName} 
                    img={isSendMe?item.sender.avt:item.receiver.avt} 
                    sameFriends={item.mutualFriends.length} 
                    sameGroups={item.mutualGroups.length}
                    sendDate={item.addFriend.createdAt} 
                    aboutMe={item.addFriend.message?item.addFriend.message:"Xin chào, rất vui được được kết bạn"}
                    button={() => { return HandleButton(isSendMe, item.addFriend._id)}}
                />
            )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        maxHeight: 420,
        alignSelf: 'center',
        marginBottom: 10,
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
    textViewAll: {
        color: Color.textOnMain2
    },
    boxContent: {
        width: '100%'
    },
})

export default PreviewRequest;
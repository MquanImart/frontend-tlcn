import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ButtonActionsProps } from "../../components/CardActionsDetails";
import { Conversation, UserDisplay } from "@/src/interface/interface_flex";
import { useState } from "react";
import restClient from "@/src/shared/services/RestClient";
import { Alert } from "react-native";
import useMessages from "../useMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileStackParamList } from "@/src/shared/routes/ProfileNavigation";
import { MyPhoto } from "@/src/interface/interface_reference";
import * as ImagePicker from 'expo-image-picker';
import getMimeType from "../../utils/getMimeType";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "Details">;
type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList, "Profile">;

interface DisplayProps {
    name: string;
    avt: MyPhoto | null;
    type: 'group' | 'private' | 'page';
}

const useDetails = (defaultConversationId: Conversation, isFriend?:boolean) => {
    const navigation = useNavigation<ChatNavigationProp>();
    const navigationProfile = useNavigation<ProfileNavigationProp>();
    const { getShortNames } = useMessages();

    const [conversation, setConversation] = useState<Conversation>(defaultConversationId);
    const [listActionUser, setListActionUser] = useState<ButtonActionsProps[] | null>(null);
    const [listActionMessage, setListActionMessage] = useState<ButtonActionsProps[] | null>(null);
    const [display, setDisplay] = useState<DisplayProps | null>(null);

    const [openEditName, setOpenEditName] = useState<boolean>(false);
    const [openEditAvtGroup, setOpenEditAvtGroup] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>(conversation.groupName?conversation.groupName:"");

    const createGroup = (otherUser: UserDisplay | null) => {
        if (isFriend){
            navigation.navigate("NewGroupChat", {defaultChoose: otherUser? [otherUser] : []})
        } else {
            Alert.alert('Thông báo', `Bạn phải kết bạn với ${otherUser?.displayName}!`)
        }
    }
    const getDataAction = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        if (conversation.type === "private"){
            const otherUser = firstOtherParticipant(conversation, userId);
            setDisplay({
                name: otherUser?otherUser.displayName : "Không xác định",
                avt: otherUser && otherUser.avt.length > 0 ? otherUser.avt[otherUser.avt.length - 1] : null,
                type: 'private'
            })
            setListActionUser([
                {text: 'Xem trang cá nhân', showIcon: true, onPress:()=>{otherUser && navigationProfile.navigate('Profile', {userId: otherUser._id})}},
                {text: `Tạo nhóm với ${otherUser?.displayName}`, showIcon: true, onPress:()=>{createGroup(otherUser)}},
            ])
            setListActionMessage([
                {text: 'Xem file và phương tiện', showIcon: true, onPress:()=>{navigation.navigate("PhotoAndFile", {conversationId: conversation._id})}},
                {text: 'Thông báo', showIcon: true, onPress:()=>{navigation.navigate("SettingsNotify", {conversation: conversation})}}
            ])
        } else if (conversation.type === "group"){
            setDisplay({
                name: conversation.groupName?conversation.groupName: getShortNames(conversation),
                avt: conversation.avtGroup ? conversation.avtGroup : null,
                type: 'group'
            })
            setListActionUser([
                {text: 'Đổi tên nhóm', showIcon: true, onPress:()=>{setOpenEditName(true)}},
                {text: 'Xem thành viên', showIcon: true, onPress:()=>{navigation.navigate("ListMember", { conversation: conversation})}},
            ])
            setListActionMessage([
                {text: 'Xem file và phương tiện', showIcon: true, onPress:()=>{navigation.navigate("PhotoAndFile", {conversationId: conversation._id})}},
                {text: 'Thông báo', showIcon: true, onPress:()=>{navigation.navigate("SettingsNotify", {conversation: conversation})}},
                {text: 'Rời nhóm', showIcon: true, onPress: LeaveGroup}
            ])
        } else {
            setDisplay({
                name: conversation.pageId? conversation.pageId.name: "Trang không xác định",
                avt: conversation.pageId && conversation.pageId.avt ? conversation.pageId.avt : null,
                type: 'page'
            })
            if (conversation.participants.some(participant => participant._id === userId)){
                setListActionUser([
                    {text: 'Xem trang', showIcon: true, onPress:()=>{}}
                ])
            } else {
                setListActionUser([
                    {text: 'Xem trang cá nhân', showIcon: true, onPress:()=>{}},
                ])
            }
            setListActionMessage([
                {text: 'Xem file và phương tiện', showIcon: true, onPress:()=>{navigation.navigate("PhotoAndFile", {conversationId: conversation._id})}},
                {text: 'Thông báo', showIcon: true, onPress:()=>{navigation.navigate("SettingsNotify", {conversation: conversation})}}
            ])
        }
    }

    const firstOtherParticipant = (conversation: Conversation, userId: string): UserDisplay | null => {
        return conversation.participants.filter(participant => participant._id !== userId)[0] || null;
    };

    const onPressHeaderLeft = () => {
        navigation.goBack();
    }

    const LeaveGroup = () => {

    }

    const changeNameGroup = (value: string) => {
        setNewName(value);
        setOpenEditName(false);
        changeGroupAPI(value);
        if (display){
            setDisplay({
                ...display,
                name: value,
            })
        }
    }

    const changeGroupAPI = async (nameGroup: string) => {
        const conversationAPI = restClient.apiClient.service(`apis/conversations`);
        const result = await conversationAPI.patch(conversation._id, {groupName: nameGroup})
        if (result.success){
            Alert.alert("Cập nhật thành công")
        } else {
            Alert.alert("Cập nhật thất bại")
        }
    }
    
    const openImagePicker = async () => {
        // Yêu cầu quyền truy cập thư viện ảnh
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Bạn cần cấp quyền để chọn ảnh hoặc video!');
          return null;
        }
      
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép chọn cả ảnh và video
          allowsEditing: false,
          quality: 1,
        });
        
        const userId = await AsyncStorage.getItem('userId');
        if (!result.canceled && userId) {
          const asset = result.assets[0];
          const type = asset.type === 'video' ? 'video' : 'img';
      
          if (type === 'video') {
            Alert.alert('Thông báo', 'Ảnh địa diện không thể là video!');
            return;
          }

          const formData = new FormData();
          const fileName = asset.uri.split('/').pop() || 'file';
          const fileType = getMimeType(fileName);
              
          const file = {
              uri: asset.uri,
              name: fileName,
              type: fileType,
          } as any;
  
          formData.append("file", file);
          formData.append("userId", userId);

          const conversationAPI = restClient.apiClient.service(`apis/conversations/avt-groups`);
          const resultAPI = await conversationAPI.patch(conversation._id, formData)
          if (resultAPI.success){
            setConversation({
                ...conversation,
                avtGroup: resultAPI.data.avtGroup
            })
            Alert.alert("Cập nhật thành công")
          } else {
            Alert.alert("Cập nhật thất bại")
          }
        }

    };  

    const openCamera = async () => {
        // Yêu cầu quyền truy cập camera
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Bạn cần cấp quyền để chụp ảnh hoặc quay video!');
          return null;
        }
      
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép cả ảnh và video
          allowsEditing: true,
          quality: 1,
        });
        
        const userId = await AsyncStorage.getItem('userId');
        if (!result.canceled && userId) {
          const asset = result.assets[0]; // Lấy file đầu tiên được chụp/quay
          const type = asset.type === 'video' ? 'video' : 'img';
      
          if (type === 'video') {
            Alert.alert('Thông báo', 'Ảnh địa diện không thể là video!');
            return;
          }

          const formData = new FormData();
          formData.append("userId", userId);

          const fileName = asset.uri.split('/').pop() || 'file';
          const fileType = getMimeType(fileName);
              
          const file = {
              uri: asset.uri,
              name: fileName,
              type: fileType,
          } as any;
  
          formData.append("file", file);
          const conversationAPI = restClient.apiClient.service(`apis/conversations/avt-groups`);
          const resultAPI = await conversationAPI.patch(conversation._id, formData)
          if (resultAPI.success){
            Alert.alert("Cập nhật thành công")
          } else {
            Alert.alert("Cập nhật thất bại")
          }
        }
    };

    const handleOpenImagePicker = () => {
        if (conversation.type !== 'group') return;
        Alert.alert(
          "Chọn ảnh",
          "Bạn muốn chọn ảnh từ đâu?",
          [
            { text: "Bộ sưu tập", onPress: openImagePicker },
            { text: "Camera", onPress: openCamera },
            { text: "Hủy", style: "cancel" }
          ]
        );
    };

    return {
        conversation, display,
        onPressHeaderLeft,
        listActionUser,
        listActionMessage,
        getDataAction,
        openEditName, setOpenEditName,
        newName, changeNameGroup,
        openEditAvtGroup,
        setOpenEditAvtGroup,
        handleOpenImagePicker
    }
}

export default useDetails;
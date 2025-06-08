import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import getColor from "@/src/styles/Color";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { Image } from 'expo-image';
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CardActionsDetails } from "../../components/CardActionsDetails";
import RenameGroupModal from "../../components/RenameGroupModal";
import useDetails from "./useDetails";

const Color = getColor();


const DetailsConversations = () => {
    const route = useRoute<RouteProp<ChatStackParamList, "Details">>();
    const { defaultConversation, isFriend } = route.params || {};
    
    const { 
        onPressHeaderLeft,
        listActionMessage, listActionUser,
        getDataAction, display,
        openEditName, setOpenEditName,
        newName, changeNameGroup,
        handleOpenImagePicker,
        conversation
    } = useDetails(defaultConversation, isFriend);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getDataAction();
            }
            load(); 
        }, [conversation])
    );
      
    if (!listActionUser || !listActionMessage || !display) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <View style={styles.container}>
            <CHeaderIcon label={""} IconLeft={"arrow-back-ios"} onPressLeft={onPressHeaderLeft}/>
            <View style={styles.column_center}>
                <TouchableOpacity onPress={() => {handleOpenImagePicker()}}>
                    <Image style={styles.avt} 
                        source={display.avt ? {uri: display.avt.url} : (
                        display.type === 'group'? require('@/src/assets/images/default/default_group_message.png'):
                        display.type === 'private'? require('@/src/assets/images/default/default_user.png'):
                        require('@/src/assets/images/default/default_page.jpg')
                        )}
                    />
                </TouchableOpacity>
                <Text style={styles.textName}>{display.name}</Text>
                <CardActionsDetails label={"Hành động"} buttons={listActionUser}/>
                <CardActionsDetails label={"Cài đặt trò chuyện"} buttons={listActionMessage}/>
            </View>
            <RenameGroupModal visible={openEditName} currentName={newName} 
                onRename={changeNameGroup} 
                onCancel={() => {setOpenEditName(false)}}/>
        </View> 
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround
    },
    column_center: {
        alignItems: 'center',
        width: '100%'
    },
    avt: {
        width: 150, height: 150,
        borderRadius: 75
    },
    textName: {
        fontWeight: 'bold',
        fontSize: 20,
        marginVertical: 20
    }
})

export default DetailsConversations;
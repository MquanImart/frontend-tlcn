import { View, StyleSheet, Image, Text, ActivityIndicator } from "react-native"
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { CardActionsDetails } from "../../components/CardActionsDetails";
import getColor from "@/src/styles/Color";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import useDetails from "./useDetails";
import { useCallback } from "react";
import RenameGroupModal from "../../components/RenameGroupModal";

const Color = getColor();


const DetailsConversations = () => {
    const route = useRoute<RouteProp<ChatStackParamList, "Details">>();
    const { defaultConversation } = route.params || {};
    
    const { 
        onPressHeaderLeft,
        listActionMessage, listActionUser,
        getDataAction, display,
        openEditName, setOpenEditName,
        newName, changeNameGroup
    } = useDetails(defaultConversation);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                await getDataAction();
            }
            load(); 
        }, [])
    );
      
    if (!listActionUser || !listActionMessage || !display) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
    return (
        <View style={styles.container}>
            <CHeaderIcon label={""} IconLeft={"arrow-back-ios"} onPressLeft={onPressHeaderLeft}/>
            <View style={styles.column_center}>
                <Image style={styles.avt} source={{uri: display.avt}}/>
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
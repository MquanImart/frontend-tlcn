import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { Image } from 'expo-image';
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CardActionsDetails } from "../../components/CardActionsDetails";
import RenameGroupModal from "../../components/RenameGroupModal";
import useDetails from "./useDetails";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DetailsConversations = () => {
    useTheme();
    const route = useRoute<RouteProp<ChatStackParamList, "Details">>();
    const { defaultConversation, isFriend } = route.params || {};

    const insets = useSafeAreaInsets();

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

    if (!listActionUser || !listActionMessage || !display) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.background, paddingTop: insets.top }}><ActivityIndicator size="large" color={Color.mainColor2}/></View>

    return (
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <CHeaderIcon label={""} IconLeft={"arrow-back-ios"} onPressLeft={onPressHeaderLeft}/>
            <View style={styles.column_center}>
                <TouchableOpacity onPress={() => {handleOpenImagePicker()}}>
                    <Image style={[styles.avt, { borderColor: Color.border, borderWidth: 2 }]}
                        source={display.avt ? {uri: display.avt.url} : (
                        display.type === 'group'? require('@/src/assets/images/default/default_group_message.png'):
                        display.type === 'private'? require('@/src/assets/images/default/default_user.png'):
                        require('@/src/assets/images/default/default_page.jpg')
                        )}
                    />
                </TouchableOpacity>
                <Text style={[styles.textName, { color: Color.textPrimary }]}>{display.name}</Text>
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
import { View, StyleSheet, Text, Switch, ActivityIndicator } from "react-native"
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { MessagesDrawerParamList } from "@/src/shared/routes/MessageNavigation";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import getColor from "@/src/styles/Color";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Color = getColor();

type MessagesNavigationProp = DrawerNavigationProp<MessagesDrawerParamList, "Tin nhắn">;
const SettingsMessages = () => {
    const navigation = useNavigation<MessagesNavigationProp>();
    const [setting, setSetting] = useState<{
        profileVisibility: boolean;
        allowMessagesFromStrangers: boolean;
      } | null>(null);

    useEffect(() => {
        getDataUser();
    }, []);

    const handleOpenDrawer = () => {
        navigation.openDrawer();
    };

    const getDataUser = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        const userAPI = restClient.apiClient.service(`apis/users`);
        const result = await userAPI.get(userId);
        if (result.success){
            setSetting(result.data.setting);
        }
    }

    const changeallowMessagesFromStrangers = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        if (setting){
            const userAPI = restClient.apiClient.service(`apis/users`);
            const result = await userAPI.patch(userId, { setting: {
                profileVisibility:setting.allowMessagesFromStrangers,
                allowMessagesFromStrangers: !setting.allowMessagesFromStrangers
            }});
            if (result.success){
                setSetting({
                    profileVisibility: setting.profileVisibility,
                    allowMessagesFromStrangers: !setting.allowMessagesFromStrangers
                });
            }
        }
    }

    return (
        <View style={styles.container}>
            <CHeaderIcon label={"Cài đặt"} IconLeft={"menu"} onPressLeft={handleOpenDrawer}/>
            <View style={styles.boxContent}>
                <View style={styles.settings}>
                    <Text style={styles.textSetting}>Cho phép nhận tin nhắn từ người lạ</Text>
                    {setting !== null ? <Switch
                      trackColor={{ false: '#000', true: Color.mainColor1 }}
                      thumbColor={Color.white_homologous}
                      ios_backgroundColor={Color.backGround1}
                      onValueChange={changeallowMessagesFromStrangers}
                      value={setting.allowMessagesFromStrangers}
                    /> : <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround,
    },
    boxContent: {
        marginTop: 30,
        width: '90%',
        alignSelf: 'center'
    },
    settings: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textSetting: {
        fontSize: 15
    },
})

export default SettingsMessages;
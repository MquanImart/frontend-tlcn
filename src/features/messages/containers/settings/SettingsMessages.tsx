import { View, StyleSheet, Text, Switch, ActivityIndicator } from "react-native"
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { MessagesDrawerParamList } from "@/src/shared/routes/MessageNavigation";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MessagesNavigationProp = DrawerNavigationProp<MessagesDrawerParamList, "Tin nhắn">;
const SettingsMessages = () => {
    useTheme();
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
                profileVisibility:setting.profileVisibility, // Corrected: this should be setting.profileVisibility, not allowMessagesFromStrangers
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
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <CHeaderIcon label={"Cài đặt"} IconLeft={"menu"} onPressLeft={handleOpenDrawer}/>
            <View style={styles.boxContent}>
                <View style={styles.settings}>
                    <Text style={[styles.textSetting, { color: Color.textPrimary }]}>Cho phép nhận tin nhắn từ người lạ</Text>
                    {setting !== null ? (
                        <Switch
                          trackColor={{ false: Color.border, true: Color.mainColor2 }} 
                          thumbColor={Color.textOnMain1} 
                          ios_backgroundColor={Color.backgroundSecondary} 
                          onValueChange={changeallowMessagesFromStrangers}
                          value={setting.allowMessagesFromStrangers}
                        />
                    ) : (
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <ActivityIndicator size="small" color={Color.mainColor2} />
                        </View>
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
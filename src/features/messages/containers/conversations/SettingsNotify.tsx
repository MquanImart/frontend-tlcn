import { View, StyleSheet, Text, Alert } from "react-native"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ChatStackParamList } from "@/src/shared/routes/MessageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { CardNotify, CardNotifyProps } from "../../components/CardNotify";
import { useEffect, useState } from "react";
import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { ConversationSettings } from "@/src/interface/interface_flex";
import { formatDate } from "../../utils/getTimeDate";
import CButton from "@/src/shared/components/button/CButton";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "NewChat">;


const options : CardNotifyProps[] = [
    {text: 'Bật thông báo', keyText: "on", },
    {text: 'Tắt trong 30 phút', keyText: "off-30p", },
    {text: 'Tắt trong 1 giờ', keyText: "off-1h", },
    {text: 'Tắt trong 12 giờ', keyText: "off-12h", },
    {text: 'Tắt trong 1 ngày', keyText: "off-1d", },
    {text: 'Tắt đến khi mở lại', keyText: "off", },
]

const SettingsNotify = () => {
    useTheme();
    const route = useRoute<RouteProp<ChatStackParamList, "SettingsNotify">>();
    const { conversation } = route.params || {};
    const navigation = useNavigation<ChatNavigationProp>();

    const [setting, setSetting] = useState<ConversationSettings | null>(null);
    const [chooseOption, setChooseOption] = useState<string>("");
    
    useEffect(() => {
        getUserSetting()
    }, [conversation]);

    const getUserSetting = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return alert("Bạn cần xác nhận thông tin người dùng");
        if (!conversation) return null;
        const newSetting = conversation.settings.find((setting) => setting.userId === userId) || null;
        setSetting(newSetting);
    };
    
    const calculateMuteTime = (keyText: string): number | null => {
        const now = Date.now(); // Lấy timestamp hiện tại
    
        switch (keyText) {
            case "on":
                return null; // Bật thông báo, không có muteUntil
            case "off-30p":
                return now + 30 * 60 * 1000; // Cộng thêm 30 phút
            case "off-1h":
                return now + 60 * 60 * 1000; // Cộng thêm 1 giờ
            case "off-12h":
                return now + 12 * 60 * 60 * 1000; // Cộng thêm 12 giờ
            case "off-1d":
                return now + 24 * 60 * 60 * 1000; // Cộng thêm 1 ngày
            case "off":
                return null; // Tắt thông báo vô thời hạn
            default:
                return null;
        }
    };

    const handleChange = (value: string) => {
        setChooseOption(value);
    }

    const onPressHeaderLeft = () => {
        navigation.goBack();
    }

    const handleChangeSetting = async () => {
        if (setting){
            const notifications = chooseOption === "on" ? true : false;
            const muteUntil = calculateMuteTime(chooseOption);
            const conversationAPI = restClient.apiClient.service(`apis/conversations/${conversation._id}/setting`);
            const result = await conversationAPI.patch("", {
                setting: {
                    userId: setting.userId,
                    notifications: notifications,
                    muteUntil: muteUntil,
                    _id: setting._id
                }
            })
            if (result.success){
                setSetting({
                    userId: setting.userId,
                    notifications: notifications,
                    muteUntil: muteUntil,
                    sos: setting.sos,
                    active: setting.active,
                    _id: setting._id
                })
            } else {
                Alert.alert("Cập nhật thất bại")
            }
        }
    }

    return (
        <View style={styles.container}>
            <CHeaderIcon label={"Thông báo"} IconLeft={"arrow-back-ios"} onPressLeft={onPressHeaderLeft}/>
            {setting && 
            <View style={styles.boxContent}>
                <View style={styles.boxState}>
                    <Text style={styles.textState}>
                        {setting.notifications?"Bạn đang bật thông báo" 
                            : setting.muteUntil === null? "Bạn đang tắt thông báo" 
                            : `Bạn tắt thông báo đến ${formatDate(setting.muteUntil)}`}
                        </Text>
                </View>
                <View style={styles.boxButton}>
                    {options.map((item, index) => 
                        <CardNotify key={index} text={item.text} 
                            onPress={() => {handleChange(item.keyText?item.keyText:"")}} 
                            ischoose={item.keyText === chooseOption}
                        />
                    )}
                </View>
                <CButton
                    label="Xác nhận"
                    onSubmit={handleChangeSetting}
                    style={{
                        width: "90%",
                        height: 50,
                        backColor: Color.mainColor1,
                        textColor: Color.white_homologous,
                        fontSize: 18,
                        radius: 25,
                    }}
                />
            </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround,
    },
    boxButton: {
        width: '100%',
        marginVertical: 30
    },
    boxContent: {
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    boxState: {
        marginTop: 30
    },
    textState: {
        fontSize: 15
    }
})

export default SettingsNotify;
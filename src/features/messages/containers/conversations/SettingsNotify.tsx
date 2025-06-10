import { View, StyleSheet, Text, Alert, ActivityIndicator } from "react-native"
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
import { useSafeAreaInsets } from "react-native-safe-area-context";


type ChatNavigationProp = StackNavigationProp<ChatStackParamList, "NewChat">;


const options : CardNotifyProps[] = [
    {text: 'Bật thông báo', keyText: "on", },
    {text: 'Tắt trong 30 phút', keyText: "off-30p", },
    {text: 'Tắt trong 1 giờ', keyText: "off-1h", },
    {text: 'Tắt trong 12 giờ', keyText: "off-12h", },
    {text: 'Tắt trong 1 ngày', keyText: "off-1d", },
    {text: 'Tắt đến khi mở lại', keyText: "off", },
];

const SettingsNotify = () => {
    useTheme();
    const route = useRoute<RouteProp<ChatStackParamList, "SettingsNotify">>();
    const { conversation } = route.params || {};
    const navigation = useNavigation<ChatNavigationProp>();
    const insets = useSafeAreaInsets();

    const [setting, setSetting] = useState<ConversationSettings | null>(null);
    const [chooseOption, setChooseOption] = useState<string>("");

    useEffect(() => {
        getUserSetting();
    }, [conversation]);

    const getUserSetting = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
            Alert.alert("Lỗi", "Không thể xác định thông tin người dùng.");
            return;
        }
        if (!conversation) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin cuộc trò chuyện.");
            return;
        }
        const newSetting = conversation.settings.find((setting) => setting.userId === userId) || null;
        setSetting(newSetting);
        if (newSetting) {
            if (newSetting.notifications) {
                setChooseOption("on");
            } else if (newSetting.muteUntil === null) {
                setChooseOption("off");
            } else {
                const now = Date.now();
                if (newSetting.muteUntil && newSetting.muteUntil > now) {
                    const diff = newSetting.muteUntil - now;
                    if (diff <= 30 * 60 * 1000 + 5000) setChooseOption("off-30p");
                    else if (diff <= 60 * 60 * 1000 + 5000) setChooseOption("off-1h");
                    else if (diff <= 12 * 60 * 60 * 1000 + 5000) setChooseOption("off-12h");
                    else if (diff <= 24 * 60 * 60 * 1000 + 5000) setChooseOption("off-1d");
                }
            }
        }
    };

    const calculateMuteTime = (keyText: string): number | null => {
        const now = Date.now();

        switch (keyText) {
            case "on":
                return null;
            case "off-30p":
                return now + 30 * 60 * 1000;
            case "off-1h":
                return now + 60 * 60 * 1000;
            case "off-12h":
                return now + 12 * 60 * 60 * 1000;
            case "off-1d":
                return now + 24 * 60 * 60 * 1000;
            case "off":
                return null;
            default:
                return null;
        }
    };

    const handleChange = (value: string) => {
        setChooseOption(value);
    };

    const onPressHeaderLeft = () => {
        navigation.goBack();
    };

    const handleChangeSetting = async () => {
        if (setting) {
            const notifications = chooseOption === "on" ? true : false;
            const muteUntil = calculateMuteTime(chooseOption);

            try {
                const conversationAPI = restClient.apiClient.service(`apis/conversations/${conversation._id}/setting`);
                const result = await conversationAPI.patch("", {
                    setting: {
                        userId: setting.userId,
                        notifications: notifications,
                        muteUntil: muteUntil,
                        _id: setting._id
                    }
                });

                if (result.success) {
                    setSetting({
                        userId: setting.userId,
                        notifications: notifications,
                        muteUntil: muteUntil,
                        sos: setting.sos,
                        active: setting.active,
                        _id: setting._id
                    });
                    Alert.alert("Thành công", "Cài đặt thông báo đã được cập nhật.");
                } else {
                    Alert.alert("Thất bại", "Không thể cập nhật cài đặt thông báo.");
                }
            } catch (error) {
                console.error("Lỗi khi cập nhật cài đặt thông báo:", error);
                Alert.alert("Lỗi", "Đã xảy ra lỗi khi kết nối máy chủ.");
            }
        } else {
            Alert.alert("Thông báo", "Không tìm thấy cài đặt người dùng.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Color.background, paddingTop: insets.top }]}>
            <CHeaderIcon
                label={"Thông báo"}
                IconLeft={"arrow-back-ios"}
                onPressLeft={onPressHeaderLeft}
            />
            {setting ? (
                <View style={styles.boxContent}>
                    <View style={styles.boxState}>
                        <Text style={[styles.textState, { color: Color.textPrimary }]}>
                            {setting.notifications ? "Bạn đang bật thông báo"
                                : setting.muteUntil === null ? "Bạn đang tắt thông báo"
                                : `Bạn tắt thông báo đến ${formatDate(setting.muteUntil)}`}
                        </Text>
                    </View>
                    <View style={styles.boxOptions}>
                        {options.map((item, index) =>
                            <CardNotify
                                key={index}
                                text={item.text}
                                onPress={() => { handleChange(item.keyText || "") }}
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
                            backColor: Color.mainColor2,
                            textColor: Color.textOnMain1,
                            fontSize: 18,
                            radius: 25,
                        }}
                    />
                </View>
            ) : (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                    <Text style={{ color: Color.textPrimary, marginTop: 10 }}>Đang tải cài đặt...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    boxOptions: {
        width: '100%',
        marginBottom: 20,
    },
    boxContent: {
        alignItems: 'center',
        flex: 1,
    },
    boxState: {
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    textState: {
        fontSize: 15,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SettingsNotify;
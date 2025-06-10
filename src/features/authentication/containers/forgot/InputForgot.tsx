import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { lightColor } from '@/src/styles/Colors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

const InputForgot = () => {
    const [phoneOrMail, setPhoneOrMail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<LoginNavigationProp>();

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendOtp = async () => {
        if (!phoneOrMail.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập email của bạn để tiếp tục.");
            return;
        }

        let formattedInput = phoneOrMail.trim();

        if (!isValidEmail(formattedInput)) {
            Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        setLoading(true);
        try {
            const result = await restClient.apiClient
                .service("apis/accounts/sendOtp")
                .create({ input: formattedInput });

            if (result.success) {
                Alert.alert(
                    "Thành công",
                    "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!"
                );
                navigation.navigate("OtpForgot", { email: formattedInput });
            } else {
                Alert.alert("Lỗi", result.message || "Không thể gửi OTP. Vui lòng thử lại.");
            }
        } catch (error: any) {
            console.error("Lỗi gửi OTP:", error);
            if (error?.response?.data?.message) {
                Alert.alert("Lỗi", error.response.data.message);
            } else {
                Alert.alert("Lỗi", "Đã xảy ra lỗi không xác định khi gửi OTP.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.container}>
                        <View style={styles.bannerContainer}>
                            <Image
                                source={require("../../../../assets/images/logo.png")}
                                style={styles.bannerImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={styles.instructionText}>
                            Nhập email của bạn
                        </Text>

                        <View style={styles.inputContainer}>
                            <CInput
                                placeholder="Email"
                                style={{
                                    width: "90%",
                                    height: 50,
                                    backColor: lightColor.background,
                                    textColor: lightColor.textPrimary,
                                    fontSize: 18,
                                    radius: 25,
                                    borderColor: lightColor.mainColor2,
                                }}
                                onChangeText={(text) => setPhoneOrMail(text)}
                            />
                        </View>

                        <CButton
                            label={loading ? "Đang gửi..." : "Gửi mã"}
                            onSubmit={handleSendOtp}
                            disabled={loading}
                            style={{
                                width: "90%",
                                height: 50,
                                backColor: lightColor.mainColor2,
                                textColor: lightColor.textOnMain1,
                                fontSize: 18,
                                radius: 25,
                            }}
                        >
                            {loading && (
                                <ActivityIndicator
                                    size="small"
                                    color={lightColor.textOnMain1}
                                    style={styles.loadingIndicator}
                                />
                            )}
                        </CButton>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.loginText}>
                                    Bạn đã có tài khoản?{" "}
                                    <Text
                                        style={styles.loginLink}
                                        onPress={() => navigation.navigate("Login")}
                                    >
                                        Đăng nhập
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default InputForgot;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: lightColor.background,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    bannerContainer: {
        marginBottom: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    bannerImage: {
        width: 350,
        height: 350,
    },
    instructionText: {
        fontSize: 20,
        color: lightColor.textPrimary,
        marginBottom: 20,
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 30,
    },
    footer: {
        marginTop: 120,
    },
    loginText: {
        color: lightColor.textSecondary,
        fontWeight: "bold",
    },
    loginLink: {
        color: lightColor.mainColor2,
        fontWeight: "bold",
    },
    loadingIndicator: {
        marginLeft: 10,
    },
});
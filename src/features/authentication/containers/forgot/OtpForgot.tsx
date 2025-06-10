import CButton from "@/src/shared/components/button/CButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { lightColor } from '@/src/styles/Colors';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";


type OtpForgotRouteProp = RouteProp<AuthStackParamList, "OtpForgot">;
type LoginNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

const OtpForgot = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef<Array<TextInput | null>>([]);
    const navigation = useNavigation<LoginNavigationProp>();
    const route = useRoute<OtpForgotRouteProp>();

    const email = route.params?.email.trim();

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && index > 0 && !otp[index]) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join("").trim();
        if (enteredOtp.length < 6) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP.");
            return;
        }

        try {
            const result = await restClient.apiClient
            .service("apis/accounts/verifyOtp")
            .create({ input: email, otp:enteredOtp });

            if (result.success) {
                Alert.alert("Thành công", "Xác minh OTP thành công!");
                navigation.navigate("NewPassword", { email });
            } else {
                Alert.alert("Lỗi", result.message || "Mã OTP không hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi xác minh OTP:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi xác minh OTP. Vui lòng thử lại.");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.innerContent}>
                        <View style={styles.bannerContainer}>
                            <Image source={require("../../../../assets/images/logo.png")} style={styles.bannerImage} resizeMode="contain" />
                        </View>

                        <Text style={styles.instructionText}>Nhập mã xác nhận</Text>
                        <Text style={styles.emailText}>Mã OTP đã gửi đến: **{email}**</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={el => { otpRefs.current[index] = el; }}
                                    style={[
                                        styles.otpInput,
                                        digit ? { borderColor: lightColor.mainColor2, borderWidth: 2 } : {},
                                        otpRefs.current[index]?.isFocused() ? { borderColor: lightColor.mainColor2, borderWidth: 2, backgroundColor: lightColor.backgroundSecondary } : {},
                                    ]}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    caretHidden={true}
                                />
                            ))}
                        </View>

                        <CButton
                            label="Xác nhận"
                            onSubmit={handleVerifyOtp}
                            style={{
                                width: "90%",
                                height: 50,
                                backColor: lightColor.mainColor2,
                                textColor: lightColor.textOnMain1,
                                radius: 25,
                                shadow: true,
                            }}
                        />

                        <View style={styles.spacer} />
                        <TouchableOpacity style={styles.loginLinkWrapper} onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginAccountText}>
                                Bạn đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default OtpForgot;

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: lightColor.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20,
    },
    innerContent: {
        flexGrow: 1,
        alignItems: "center",
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    bannerContainer: {
        marginBottom: 30,
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
        width: '100%',
    },
    bannerImage: {
        width: 250,
        height: 250,
        borderRadius: 15,
    },
    instructionText: {
        fontSize: 24,
        color: lightColor.textPrimary,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    emailText: {
        fontSize: 16,
        color: lightColor.textSecondary,
        marginBottom: 30,
        textAlign: "center",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "90%",
        marginBottom: 30,
    },
    otpInput: {
        width: 45,
        height: 45,
        borderWidth: 1,
        borderColor: lightColor.border,
        backgroundColor: lightColor.background,
        borderRadius: 10,
        textAlign: "center",
        fontSize: 20,
        color: lightColor.textPrimary,
    },
    spacer: {
        flex: 1,
        // No minHeight needed here, flex: 1 alone should work with space-between
    },
    loginLinkWrapper: {
        marginBottom: 20,
        marginTop: 20,
    },
    loginAccountText: {
        fontSize: 14,
        color: lightColor.textSecondary,
        textAlign: "center",
    },
    loginLink: {
        color: lightColor.mainColor2,
        fontWeight: "bold",
    },
});
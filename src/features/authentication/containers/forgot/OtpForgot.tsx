import CButton from "@/src/shared/components/button/CButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import getColor from "@/src/styles/Color";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

const Color = getColor();

type OtpForgotRouteProp = RouteProp<AuthStackParamList, "OtpForgot">;
type LoginNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

const OtpForgot = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const otpRefs = useRef<Array<TextInput | null>>([]);
    const navigation = useNavigation<LoginNavigationProp>();
    const route = useRoute<OtpForgotRouteProp>();

    const email = route.params?.email.trim(); // Nhận email từ màn hình trước

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
        const enteredOtp = otp.join("").trim(); // Chuyển mảng thành chuỗi "123456"
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
                navigation.navigate("NewPassword", { email }); // Chuyển sang màn hình đặt mật khẩu mới
            } else {
                Alert.alert("Lỗi", result.message || "Mã OTP không hợp lệ.");
            }
        } catch (error) {
            console.error("Lỗi xác minh OTP:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi xác minh OTP. Vui lòng thử lại.");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.container}>
                        <View style={styles.bannerContainer}>
                            <Image source={require("../../../../assets/images/logo.png")} style={styles.bannerImage} resizeMode="contain" />
                        </View>

                        <Text style={styles.instructionText}>Nhập mã xác nhận</Text>
                        <Text style={styles.emailText}>Mã OTP đã gửi đến: {email}</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((_, index) => (
                                <TextInput
                                    key={index}
                                    ref={el => { otpRefs.current[index] = el; }}
                                    style={styles.otpInput}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={otp[index]}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                />
                            ))}
                        </View>

                        <CButton
                            label="Xác nhận"
                            onSubmit={handleVerifyOtp} // Gọi API khi nhấn "Xác nhận"
                            style={{ width: "90%", height: 50, backColor: Color.mainColor1, textColor: "#fff", radius: 25 }}
                        />

                        <TouchableOpacity>
                            <Text style={styles.footerText}>
                                Bạn đã có tài khoản? <Text style={styles.loginText} onPress={() => navigation.navigate("Login")}>Đăng nhập</Text>
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
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: Color.white_homologous,
        padding: 20,
    },
    bannerContainer: {
        marginBottom: 30,
        marginTop: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    bannerImage: {
        width: 350,
        height: 350,
    },
    instructionText: {
        fontSize: 22,
        color: Color.white_contrast,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    emailText: {
        fontSize: 16,
        color: Color.white_contrast,
        marginBottom: 10,
    },
    footerText: {
        marginTop: 170,
        fontSize: 14,
        color: Color.white_contrast,
        textAlign: "center",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 20,
    },
    otpInput: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: Color.mainColor2,
        backgroundColor: Color.white_homologous,
        borderRadius: 10,
        textAlign: "center",
        fontSize: 18,
        color: Color.white_contrast,
    },
    loginText: {
        color: Color.mainColor2,
        fontWeight: "bold",
    },
});

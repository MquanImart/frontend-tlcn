import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
// import { useTheme } from '@/src/contexts/ThemeContext'; // Xóa dòng này
// import { colors as Color } from '@/src/styles/DynamicColors'; // Xóa hoặc không sử dụng nữa
import { lightColor } from "@/src/styles/Colors"; // Import lightColor

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useRef, useState } from "react";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";

type RegisterNavigationProp = StackNavigationProp<AuthStackParamList, "IDVerification">;

const Register = () => {
    // useTheme(); // Xóa lời gọi này
    const [emailOrPhone, setEmailOrPhone] = useState<string>('');
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const navigation = useNavigation<RegisterNavigationProp>();

    // Ref để tự động focus
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    // Hàm kiểm tra email và mật khẩu
    const validateAndNavigate = async () => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(emailOrPhone)) {
            Alert.alert("Lỗi", "Email không hợp lệ");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu không khớp");
            return;
        }
        // Assuming restClient.apiClient.service returns a valid service object
        // and create method exists on it.
        try {
            const emailCheck = await restClient.apiClient
                .service("apis/accounts/check-email")
                .create({
                    email: emailOrPhone
                });
            if (emailCheck.exists) {
                Alert.alert("Lỗi", "Email đã tồn tại");
                return;
            }
        } catch (error: any) {
             Alert.alert("Lỗi", error.message || "Không thể kiểm tra email. Vui lòng thử lại sau.");
             console.error("Lỗi kiểm tra email:", error);
             return; // Stop if email check fails
        }

        navigation.navigate("IDVerification", { emailOrPhone, password });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.bannerContainer}>
                        <Image
                            source={require("../../../../assets/images/logo.png")}
                            style={styles.bannerImage}
                        />
                    </View>

                    <Text style={styles.title}>Đăng ký VieWay</Text>

                    <View style={styles.inputContainer}>
                        {/* Input Email */}
                        <CInput
                            placeholder="Nhập email "
                            value={emailOrPhone}
                            onChangeText={setEmailOrPhone}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordInputRef.current?.focus()} // Chuyển focus
                            style={{
                                width: "85%",
                                height: 50,
                                backColor: lightColor.background, 
                                radius: 25,
                                borderColor: lightColor.mainColor2, 
                            }}
                        />

                        {/* Input Mật khẩu */}
                        <CInput
                            ref={passwordInputRef} // Gán ref cho ô mật khẩu
                            placeholder="Mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            isPasswordInput
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordInputRef.current?.focus()} // Chuyển focus
                            style={{
                                width: "79%",
                                height: 50,
                                backColor: lightColor.background, 
                                radius: 25,
                                borderColor: lightColor.mainColor2,
                            }}
                        />

                        {/* Input Nhập lại Mật khẩu */}
                        <CInput
                            ref={confirmPasswordInputRef} 
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            isPasswordInput
                            returnKeyType="done"
                            style={{
                                width: "79%",
                                height: 50,
                                backColor: lightColor.background, 
                                radius: 25,
                                borderColor: lightColor.mainColor2, 
                            }}
                        />
                    </View>

                    {/* Nút xác nhận */}
                    <View style={styles.buttonContainer}>
                        <CButton
                            label="Xác nhận"
                            onSubmit={validateAndNavigate} 
                            style={{
                                width: "85%",
                                height: 50,
                                backColor: lightColor.mainColor2, 
                                textColor: lightColor.textOnMain1, 
                                fontSize: 18,
                                radius: 25,
                            }}
                        />

                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginText}>
                                Bạn đã có tài khoản?{" "}
                                <Text style={styles.loginLink}>
                                    Đăng nhập
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightColor.background, 
    },
    scrollView: {
        flexGrow: 1,
    },
    bannerContainer: {
        marginTop: 30,
        alignItems: "center",
    },
    bannerImage: {
        width: 350,
        height: 350,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: lightColor.textPrimary, 
        marginBottom: 20,
        textAlign: "center",
    },
    inputContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: 10,
        gap: 10,
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    loginText: {
        marginTop: 20,
        fontSize: 14,
        color: lightColor.textSecondary,
    },
    loginLink: {
        color: lightColor.mainColor2,
        fontWeight: "bold",
    },
});
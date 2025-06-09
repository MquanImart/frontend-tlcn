import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import { Image } from 'expo-image';
import React, { useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
type NewPasswordRouteProp = RouteProp<AuthStackParamList, "NewPassword">;
type LoginNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;
const NewPassword = () => {
    useTheme();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordRef = useRef<TextInput | null>(null);
    const confirmPasswordRef = useRef<TextInput | null>(null);
    const navigation = useNavigation<LoginNavigationProp>();
    const route = useRoute<NewPasswordRouteProp>();

    const email = route.params?.email; // Nhận email từ màn hình trước

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu không khớp!");
            return;
        }

        try {
            const result = await restClient.apiClient
                .service("apis/accounts/updatePassword")
                .create({ email, newPassword: password });

            if (result.success) {
                Alert.alert("Thành công", "Mật khẩu đã được cập nhật!", [
                    { text: "OK", onPress: () => navigation.navigate("Login") }
                ]);
            } else {
                Alert.alert("Lỗi", result.message || "Không thể cập nhật mật khẩu.");
            }
        } catch (error) {
            console.error("Lỗi cập nhật mật khẩu:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại.");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.innerContainer}>
                        <View style={styles.bannerContainer}>
                            <Image source={require("../../../../assets/images/logo.png")} style={styles.bannerImage} resizeMode="contain" />
                        </View>

                        <Text style={styles.titleText}>Nhập mật khẩu mới</Text>

                        <CInput
                            placeholder="Mật khẩu"
                            style={{ width: "85%", height: 50, backColor: "#fff", textColor: "#000", fontSize: 16, radius: 25, borderColor: "#DD88CF" }}
                            isPasswordInput={true}
                            onChangeText={(text) => setPassword(text)}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                            ref={passwordRef}
                        />
                        <View style={{ marginBottom: 5 }}></View>
                        <CInput
                            placeholder="Nhập lại mật khẩu"
                            style={{ width: "85%", height: 50, backColor: "#fff", textColor: "#000", fontSize: 16, radius: 25, borderColor: "#DD88CF" }}
                            isPasswordInput={true}
                            onChangeText={(text) => setConfirmPassword(text)}
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                            ref={confirmPasswordRef}
                        />
                        <View style={{ marginBottom: 55 }}></View>

                        <CButton
                            label="Xác nhận"
                            onSubmit={handleSubmit} // 🔥 Gọi API khi bấm "Xác nhận"
                            style={{ width: "94%", height: 50, backColor: "#4B164C", textColor: "#fff", radius: 25 }}
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
export default NewPassword;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    innerContainer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    bannerContainer: {
        marginBottom: 20,
        marginTop: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    bannerImage: {
        width: 350,
        height: 350,
    },
    titleText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 20,
    },
    footerText: {
        marginTop: 20,
        fontSize: 14,
        color: "#000",
        textAlign: "center",
    },
    loginText: {
        color: "#DD88CF",
        fontWeight: "bold",
    },
});

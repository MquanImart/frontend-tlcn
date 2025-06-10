import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import { Image } from 'expo-image';
import React, { useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { lightColor } from '@/src/styles/Colors';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type NewPasswordRouteProp = RouteProp<AuthStackParamList, "NewPassword">;
type LoginNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

const NewPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const passwordRef = useRef<TextInput | null>(null);
    const confirmPasswordRef = useRef<TextInput | null>(null);
    const navigation = useNavigation<LoginNavigationProp>();
    const route = useRoute<NewPasswordRouteProp>();

    const email = route.params?.email;

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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.innerContentWrapper}>
                        <View style={styles.bannerContainer}>
                            <Image source={require("../../../../assets/images/logo.png")} style={styles.bannerImage} resizeMode="contain" />
                        </View>

                        <Text style={styles.titleText}>Nhập mật khẩu mới</Text>

                        <View style={styles.inputWrapper}>
                            <CInput
                                placeholder="Mật khẩu"
                                style={{
                                    width: "100%",
                                    height: 50,
                                    backColor: lightColor.background,
                                    textColor: lightColor.textPrimary,
                                    fontSize: 18,
                                    radius: 25,
                                    borderColor: lightColor.mainColor2,
                                }}
                                isPasswordInput={true}
                                onChangeText={(text) => setPassword(text)}
                                returnKeyType="next"
                                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                ref={passwordRef}
                            />
                            <View style={styles.inputSpacing}></View>
                            <CInput
                                placeholder="Nhập lại mật khẩu"
                                style={{
                                    width: "100%",
                                    height: 50,
                                    backColor: lightColor.background,
                                    textColor: lightColor.textPrimary,
                                    fontSize: 18,
                                    radius: 25,
                                    borderColor: lightColor.mainColor2,
                                }}
                                isPasswordInput={true}
                                onChangeText={(text) => setConfirmPassword(text)}
                                returnKeyType="done"
                                onSubmitEditing={Keyboard.dismiss}
                                ref={confirmPasswordRef}
                            />
                        </View>

                        <CButton
                            label="Xác nhận"
                            onSubmit={handleSubmit}
                            style={{
                                width: "90%",
                                height: 50,
                                backColor: lightColor.mainColor2,
                                textColor: lightColor.textOnMain1,
                                radius: 25,
                                shadow: true,
                            }}
                        />

                        <View style={styles.bottomLinkContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.loginAccountText}>
                                    Bạn đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};
export default NewPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightColor.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    innerContentWrapper: {
        flex: 1,
        alignItems: "center",
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: 20,
    },
    bannerContainer: {
        marginBottom: 30,
        marginTop: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    bannerImage: {
        width: 250,
        height: 250,
        borderRadius: 15,
    },
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
        color: lightColor.textPrimary,
        marginBottom: 30,
        textAlign: "center",
    },
    inputWrapper: {
        width: "90%",
        marginBottom: 30,
        alignItems: 'center',
    },
    inputSpacing: {
        marginBottom: 15,
    },
    bottomLinkContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
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
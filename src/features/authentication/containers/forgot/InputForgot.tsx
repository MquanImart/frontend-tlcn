import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
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
    useTheme();
    const [phoneOrMail, setPhoneOrMail] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state
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
    
        let formattedInput = phoneOrMail.trim(); // Remove whitespace
    
        if (!isValidEmail(formattedInput)) {
            Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }
    
        setLoading(true); // Set loading to true when request starts
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
            setLoading(false); // Reset loading state when request completes
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
                        {/* Circular image banner */}
                        <View style={styles.bannerContainer}>
                            <Image
                                source={require("../../../../assets/images/logo.png")}
                                style={styles.bannerImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Instruction text */}
                        <Text style={styles.instructionText}>
                            Nhập email của bạn
                        </Text>

                        {/* Input field */}
                        <View style={styles.inputContainer}>
                            <CInput
                                placeholder="Email"
                                style={{
                                    width: "90%",
                                    height: 50,
                                    backColor: Color.white_contrast,
                                    textColor: Color.white_contrast,
                                    fontSize: 18,
                                    radius: 25,
                                    borderColor: Color.mainColor1,
                                }}
                                onChangeText={(text) => setPhoneOrMail(text)}
                            />
                        </View>

                        {/* Button with loading state */}
                        <CButton
                            label={loading ? "Đang gửi..." : "Gửi mã"}
                            onSubmit={handleSendOtp}
                            disabled={loading} // Disable button while loading
                            style={{
                                width: "90%",
                                height: 50,
                                backColor: loading ? Color.mainColor1 : Color.mainColor1, // Change background color when loading
                                textColor: Color.white_homologous,
                                fontSize: 18,
                                radius: 25,
                            }}
                        >
                            {loading && (
                                <ActivityIndicator
                                    size="small"
                                    color={Color.white_homologous}
                                    style={styles.loadingIndicator}
                                />
                            )}
                        </CButton>

                        {/* Footer link */}
                        <View style={styles.footer}>
                            <TouchableOpacity>
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
        backgroundColor: Color.white_homologous,
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
        color: Color.white_contrast,
        fontWeight: "bold",
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
        color: Color.white_contrast,
        fontWeight: "bold",
    },
    loginLink: {
        color: Color.mainColor1,
        fontWeight: "bold",
    },
    loadingIndicator: {
        marginRight: 10,
    },
});
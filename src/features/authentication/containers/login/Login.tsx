import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { useRef, useState } from "react";
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
  View,
} from "react-native";

const accountClient = restClient.apiClient.service("apis/accounts");
type AuthNavigationProp = StackNavigationProp<AuthStackParamList, "Login">;

const Login = () => {
  useTheme();
  const [emailOrPhone, setEmailOrPhone] = useState<string>("21110740@student.hcmute.edu.vn");
  const [password, setPassword] = useState<string>("123456");
  const navigation = useNavigation<AuthNavigationProp>();

  // Ref để focus vào ô mật khẩu sau khi nhập xong email/số điện thoại
  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email/số điện thoại và mật khẩu");
      return;
    }

    try {
      const response = await accountClient.authentication(emailOrPhone, password);
      if (response.success) {
        const role = await AsyncStorage.getItem("role");
        if (role === "admin") {
          navigation.navigate("AdminDashboard");
        } else {
          navigation.navigate("TabbarNavigation");
        }
      } else {
        Alert.alert("Thông báo", response.messages || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể kết nối đến server");
      console.error("Lỗi đăng nhập:", error);
    }
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
          <View style={styles.inner}>
            {/* Tiêu đề */}
            <Text style={styles.title}>
              Khám phá và kết nối{`\n`}với vẻ đẹp Việt Nam
            </Text>

            {/* Hình ảnh logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>

            {/* Tiêu đề đăng nhập */}
            <Text style={styles.loginTitle}>Đăng nhập VieWay</Text>

            {/* Input Nhập Email hoặc Số điện thoại */}
            <View style={styles.inputContainer}>
              <CInput
                placeholder="Nhập email hoặc số điện thoại"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                style={{
                  width: "85%",
                  height: 50,
                  radius: 25,
                  backColor: Color.backGround,
                  borderColor: Color.mainColor2,
                }}
              />

              {/* Input Nhập Mật khẩu */}
              <CInput
                ref={passwordInputRef}
                placeholder="Nhập mật khẩu"
                isPasswordInput={true}
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                style={{
                  width: "79%",
                  height: 50,
                  backColor: Color.backGround,
                  radius: 25,
                  borderColor: Color.mainColor2,
                }}
              />

              <View style={styles.buttonContainer}>
                <CButton
                  label="Đăng nhập"
                  onSubmit={handleLogin}
                  style={{
                    width: "85%",
                    height: 50,
                    backColor: Color.mainColor2,
                    textColor: Color.white_homologous,
                    fontSize: 18,
                    radius: 25,
                  }}
                />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate("InputForgot")}>
                <Text style={styles.registerLink}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Đăng ký */}
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>
                  Bạn chưa có tài khoản?{" "}
                  <Text style={styles.registerLink}>Đăng ký</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  scrollView: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: Color.white_contrast,
    marginBottom: 5,
    marginTop: 10,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 250,
    height: 250,
    borderRadius: 50,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Color.white_contrast,
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 5,
  },
  registerText: {
    fontSize: 14,
    color: Color.textColor4,
    marginTop: 10,
  },
  registerLink: {
    fontSize: 15,
    color: Color.mainColor2,
    fontWeight: "bold",
    marginTop: 15,
  },
});
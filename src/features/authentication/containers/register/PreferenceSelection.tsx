import React, { useState, useMemo, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";

type PreferenceSelectionNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "PreferenceSelection"
>;
type PreferenceSelectionRouteProp = RouteProp<AuthStackParamList, "PreferenceSelection">;

const PreferenceSelection = () => {
  useTheme();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigation = useNavigation<PreferenceSelectionNavigationProp>();
  const route = useRoute<PreferenceSelectionRouteProp>();
  const email = route.params.email;

  // Lấy danh sách categories từ API
  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await restClient.apiClient.service("apis/hobbies").find({});

        if (response.success && Array.isArray(response.data)) {
          // Trích xuất thuộc tính name từ mỗi document
          const hobbyNames = response.data.map((hobby: any) => hobby.name);
          setCategories(hobbyNames); // Đảm bảo categories là mảng chuỗi
        } else {
          Alert.alert("Lỗi", "Không thể tải danh sách sở thích từ server.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sở thích:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải danh sách sở thích.");
      }
    };

    fetchHobbies();
  }, []);

  // Tạo buttonData từ categories
  const buttonData = useMemo(
    () =>
      categories.map(category => ({
        label: category,
        width: `${Math.floor(Math.random() * (200 - 120 + 1) + 100)}`,
      })),
    [categories]
  );

  const handleToggle = (label: string, isActive: boolean) => {
    setSelectedCategories(prev =>
      isActive ? [...prev, label] : prev.filter(item => item !== label)
    );
  };

  const handleSkip = () => {
    navigation.navigate("Login");
  };

  const handleConfirm = async () => {
    try {
      const result = await restClient.apiClient
        .service("apis/users/addHobbyByEmail")
        .create({ email: email, hobbies: selectedCategories });
      if (result.success) {
        Alert.alert("Thành công", "Sở thích đã được lưu thành công!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Lỗi", result.message || "Không thể lưu sở thích.");
      }
    } catch (error) {
      console.error("Frontend Error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm sở thích.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bạn thích xem gì?</Text>
      {categories.length === 0 ? (
        <Text style={styles.loadingText}>Đang tải danh sách sở thích...</Text>
      ) : (
        <View style={styles.buttonContainer}>
          {buttonData.map((item, index) => (
            <CButton
              key={index}
              label={item.label}
              onSubmit={() =>
                handleToggle(item.label, !selectedCategories.includes(item.label))
              }
              style={{
                width: item.width,
                height: 50,
                backColor: selectedCategories.includes(item.label)
                  ? Color.mainColor1
                  : "transparent",
                textColor: selectedCategories.includes(item.label)
                  ? Color.white_homologous
                  : Color.mainColor1,
                fontSize: 18,
                boderColor: selectedCategories.includes(item.label)
                  ? Color.white_homologous
                  : Color.mainColor1,
                borderWidth: 2,
                fontWeight: "500",
                radius: 50,
              }}
            />
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <CButton
          label="Bỏ qua"
          onSubmit={handleSkip}
          style={{
            width: "45%",
            height: 50,
            backColor: "transparent",
            textColor: Color.mainColor1,
            fontSize: 18,
            boderColor: Color.mainColor2,
            borderWidth: 1,
            fontWeight: "bold",
            radius: 25,
          }}
        />
        <CButton
          label="Xác nhận"
          onSubmit={handleConfirm}
          style={{
            width: "45%",
            height: 50,
            backColor: Color.mainColor1,
            textColor: Color.white_homologous,
            fontSize: 18,
            fontWeight: "bold",
            radius: 25,
          }}
        />
      </View>

      {/* Chuyển hướng đăng nhập */}
      <View style={styles.loginContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>
            Bạn đã có tài khoản?
            <Text style={styles.loginLink}> Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreferenceSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white_homologous,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  buttonContainer: {
    marginTop: 50,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 10,
    width: "100%",
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    position: "absolute",
    bottom: 90,
    width: "90%",
    alignSelf: "center",
  },
  loginContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
  loginText: {
    fontSize: 14,
    textAlign: "center",
    color: Color.white_contrast,
  },
  loginLink: {
    color: Color.mainColor2,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: Color.white_contrast,
    marginTop: 50,
  },
});
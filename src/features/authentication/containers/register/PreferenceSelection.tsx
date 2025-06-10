import React, { useState, useMemo, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import CButton from "@/src/shared/components/button/CButton";
import { lightColor } from '@/src/styles/Colors';
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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoadingHobbies, setIsLoadingHobbies] = useState<boolean>(true);
  const navigation = useNavigation<PreferenceSelectionNavigationProp>();
  const route = useRoute<PreferenceSelectionRouteProp>();
  const email = route.params.email;

  // Lấy danh sách categories từ API
  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await restClient.apiClient.service("apis/hobbies").find({});

        if (response.success && Array.isArray(response.data)) {
          const hobbyNames = response.data.map((hobby: any) => hobby.name);
          setCategories(hobbyNames);
        } else {
          Alert.alert("Lỗi", "Không thể tải danh sách sở thích từ server.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sở thích:", error);
        Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải danh sách sở thích.");
      } finally {
        setIsLoadingHobbies(false);
      }
    };

    fetchHobbies();
  }, []);

  // Tạo buttonData từ categories
  // KHÔNG CÒN TẠO 'width' NỮA
  const buttonData = useMemo(
    () =>
      categories.map(category => ({
        label: category,
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
    if (selectedCategories.length < 3) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 3 sở thích.");
      return;
    }

    try {
      const result = await restClient.apiClient
        .service("apis/users/addHobbyByEmail")
        .create({ email: email, hobbies: selectedCategories });
      if (result.success) {
        Alert.alert("Thành công", "Sở thích đã được lưu thành công!", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
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
      <Text style={styles.subHeader}>
        Chọn ít nhất 3 sở thích bạn quan tâm để chúng tôi gợi ý tốt hơn.
      </Text>
      {isLoadingHobbies ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lightColor.mainColor2} />
          <Text style={styles.loadingText}>Đang tải danh sách sở thích...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.hobbiesBackground}>
            <View style={styles.buttonContainer}>
              {buttonData.map((item, index) => (
                <CButton
                  key={index}
                  label={item.label}
                  onSubmit={() =>
                    handleToggle(item.label, !selectedCategories.includes(item.label))
                  }
                  // Không còn truyền 'width' từ đây nữa
                  style={{
                    height: 50,
                    backColor: selectedCategories.includes(item.label)
                      ? lightColor.mainColor2
                      : "transparent",
                    textColor: selectedCategories.includes(item.label)
                      ? lightColor.textOnMain1
                      : lightColor.mainColor2,
                    fontSize: 16,
                    boderColor: selectedCategories.includes(item.label)
                      ? lightColor.textOnMain1
                      : lightColor.mainColor2,
                    borderWidth: 2,
                    fontWeight: "500",
                    radius: 50,
                  }}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <CButton
          label="Bỏ qua"
          onSubmit={handleSkip}
          style={{
            width: "45%",
            height: 50,
            backColor: "transparent",
            textColor: lightColor.mainColor2,
            fontSize: 18,
            boderColor: lightColor.mainColor2,
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
            backColor: lightColor.mainColor2,
            textColor: lightColor.textOnMain1,
            fontSize: 18,
            fontWeight: "bold",
            radius: 25,
          }}
        />
      </View>

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
    backgroundColor: lightColor.background,
    alignItems: "center",
    paddingTop: 0,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 50,
    color: lightColor.textPrimary,
  },
  subHeader: {
    fontSize: 15,
    textAlign: "center",
    color: lightColor.textSecondary,
    marginBottom: 25,
    paddingHorizontal: 25,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 100,
  },
  hobbiesBackground: {
    backgroundColor: lightColor.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: lightColor.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 12,
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    width: "90%",
    alignSelf: "center",
  },
  loginContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  loginText: {
    fontSize: 14,
    textAlign: "center",
    color: lightColor.textSecondary,
  },
  loginLink: {
    color: lightColor.mainColor2,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    color: lightColor.textSecondary,
    marginTop: 10,
  },
});
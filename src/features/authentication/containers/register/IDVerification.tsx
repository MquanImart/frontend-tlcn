import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { lightColor } from '@/src/styles/Colors'; // Import lightColor

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type NavigationProp = StackNavigationProp<AuthStackParamList, "Login">;
type IDVerificationRouteProp = RouteProp<AuthStackParamList, "IDVerification">;

interface CccdDataType {
  number: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  dateOfExpiry: string;
}

const extractCCCDData = async (imageUri: string, mimeType: string = 'image/jpeg'): Promise<CccdDataType> => {
  try {
    const formData = new FormData();
    formData.append('cccdImage', {
      uri: imageUri,
      type: mimeType,
      name: 'cccd.jpg',
    } as any);

    const response = await restClient.apiClient
      .service("apis/identifications/extract")
      .create(formData);

    if (!response || !response.success) {
      // Check for specific backend duplicate key error from the extraction service
      if (response?.messages && response.messages.includes("E11000 duplicate key error collection")) {
        throw new Error("Căn cước công dân đã được sử dụng!");
      }
      throw new Error(response?.messages || 'Lỗi server không xác định');
    }
    const cccdData = response.data;
    return {
      number: cccdData.number || '',
      fullName: cccdData.fullName || '',
      dateOfBirth: cccdData.dateOfBirth || '',
      sex: cccdData.sex || '',
      nationality: cccdData.nationality || '',
      placeOfOrigin: cccdData.placeOfOrigin || '',
      placeOfResidence: cccdData.placeOfResidence || '',
      dateOfExpiry: cccdData.dateOfExpiry || '',
    };
  } catch (error) {
    // Re-throw specific error messages or provide a general one
    if (error instanceof Error && error.message.includes("Căn cước công dân đã được sử dụng!")) {
      throw error; // Propagate the specific duplicate CCCD error
    }
    throw new Error("Căn cước công dân không hợp lệ hoặc không thể đọc được.");
  }
};

const calculateAge = (dateOfBirth: string): number => {
  try {
    // Convert DD/MM/YYYY to YYYY-MM-DD for Date object
    const dob = new Date(dateOfBirth.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
    if (isNaN(dob.getTime())) {
      throw new Error('Ngày sinh không hợp lệ');
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  } catch (error) {
    throw new Error('Không thể tính tuổi từ ngày sinh');
  }
};

const IDVerification = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [hashtag, setHashtag] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<{ uri: string, type: string } | null>(null);
  const [cccdData, setCccdData] = useState<CccdDataType | null>(null); // Use CccdDataType for better type safety
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<IDVerificationRouteProp>();
  const emailOrPhone = route.params?.emailOrPhone;
  const password = route.params?.password;
  const codeInputRef = useRef<TextInput>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const imageData = { uri: result.assets[0].uri, type: "image" };
      setSelectedImage(imageData);
      setCccdData(null); // Clear previous CCCD data when a new image is selected
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập máy ảnh!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const imageData = { uri: result.assets[0].uri, type: "image" };
      setSelectedImage(imageData);
      setCccdData(null); // Clear previous CCCD data when a new image is taken
    }
  };

  const handleCreateAccount = async () => {
    if (isLoading) return; // Prevent multiple submissions

    if (!displayName || !hashtag) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và mã hashtag.");
      return;
    }

    setIsLoading(true); // Start loading before API calls

    try {
      // 1. Check hashtag uniqueness
      const hashtagCheck = await restClient.apiClient
        .service("apis/accounts/check-hashtag")
        .create({ hashtag });
      if (hashtagCheck.exists) {
        Alert.alert("Lỗi", "Hashtag đã tồn tại trong hệ thống");
        setIsLoading(false); // Stop loading on error
        return;
      }

      // 2. Ensure an image is selected
      if (!selectedImage) {
        Alert.alert("Lỗi", "Vui lòng chọn hoặc chụp ảnh CCCD.");
        setIsLoading(false); // Stop loading on error
        return;
      }

      // 3. Extract CCCD data from the selected image
      const extractedData = await extractCCCDData(selectedImage.uri);
      setCccdData(extractedData); // Update state with extracted data

      // 4. Verify age
      const age = calculateAge(extractedData.dateOfBirth);
      if (age < 18) {
        Alert.alert("Lỗi", "Bạn phải từ 18 tuổi trở lên để tạo tài khoản!");
        setIsLoading(false); // Stop loading on error
        return;
      }

      // 5. Process address and fetch coordinates
      let province = "";
      let district = "";
      let ward = "";
      let street = "";
      // 'placeName' is not used, consider removing if not needed for backend.
      // let placeName = "";
      let lat: number | null = null;
      let long: number | null = null;

      if (extractedData.placeOfResidence) {
        const addressParts = extractedData.placeOfResidence.split(", ").map((part: string) => part.trim());
        province = addressParts[addressParts.length - 1] || "";
        district = addressParts[addressParts.length - 2] || "";
        ward = addressParts[addressParts.length - 3] || "";
        // Join remaining parts for street, excluding ward, district, province
        street = addressParts.slice(0, addressParts.length - 3).join(", ") || "";

        const fullAddressForGeo = `${ward}, ${district}, ${province}`.trim();
        if (fullAddressForGeo) { // Only try to geocode if address is non-empty
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddressForGeo)}&format=json&limit=1`
            );
            const result = response.data[0];
            if (result) {
              lat = parseFloat(result.lat);
              long = parseFloat(result.lon);
            } else {
              console.warn("Không tìm thấy tọa độ cho địa chỉ:", fullAddressForGeo);
            }
          } catch (apiError) {
            console.error("Lỗi khi gọi Nominatim API:", apiError);
            Alert.alert("Cảnh báo", "Không thể lấy tọa độ địa chỉ. Tiếp tục mà không có lat/long.");
          }
        }
      }

      // 6. Call the account creation API
      const result = await restClient.apiClient
        .service("apis/accounts/create")
        .create({
          email: emailOrPhone,
          password,
          displayName,
          hashtag,
          number: extractedData.number,
          fullName: extractedData.fullName,
          dateOfBirth: extractedData.dateOfBirth,
          sex: extractedData.sex,
          nationality: extractedData.nationality || "Việt Nam", // Default if empty
          placeOfOrigin: extractedData.placeOfOrigin,
          placeOfResidence: extractedData.placeOfResidence,
          dateOfExpiry: extractedData.dateOfExpiry,
          province,
          district,
          ward,
          street,
          // placeName, // Removed as it's not used
          lat,
          long,
        });

      if (result.success) {
        Alert.alert("Thành công", "Tài khoản đã được tạo!", [
          { text: "OK", onPress: () => navigation.navigate("PreferenceSelection", { email: emailOrPhone }) },
        ]);
      } else {
        // Generic error message for other backend issues from account creation
        Alert.alert("Lỗi", result.message || "Không thể tạo tài khoản.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsLoading(false); // Always stop loading
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
          <View style={styles.innerContainer}>
            <View style={styles.bannerContainer}>
              <Image
                source={require("../../../../assets/images/logo.png")}
                style={styles.bannerImage}
              />
            </View>

            <Text style={styles.title}>Chúng tôi gọi bạn là</Text>

            <View style={styles.row}>
              <View style={{ flex: 7 }}>
                <CInput
                  placeholder="Nhập tên"
                  value={displayName}
                  onChangeText={setDisplayName}
                  returnKeyType="next"
                  onSubmitEditing={() => codeInputRef.current?.focus()}
                  style={{
                    width: "100%",
                    height: 50,
                    backColor: lightColor.background,
                    textColor: lightColor.textPrimary,
                    radius: 25,
                    borderColor: lightColor.mainColor2,
                  }}
                />
              </View>
              <View style={{ flex: 3 }}>
                <CInput
                  ref={codeInputRef}
                  placeholder="#"
                  value={hashtag}
                  onChangeText={setHashtag}
                  returnKeyType="done"
                  style={{
                    width: "100%",
                    height: 50,
                    backColor: lightColor.background,
                    textColor: lightColor.textPrimary,
                    radius: 25,
                    borderColor: lightColor.mainColor2,
                  }}
                />
              </View>
            </View>

            <Text style={styles.subText}>Mã # dùng để phân biệt bạn với những người dùng cùng tên</Text>

            <Text style={styles.sectionTitle}>Căn cước công dân</Text>
            <View style={styles.imageButton}>
              <TouchableOpacity onPress={handlePickImage} style={styles.pickImageTouchable}>
                <Text style={styles.imageButtonText}>Chọn ảnh</Text>
              </TouchableOpacity>
              <CIconButton
                icon={<Icon name={"photo-camera"} size={35} color={lightColor.textOnMain1} />}
                onSubmit={handleTakePhoto}
                style={{
                  width: 70,
                  height: 50,
                  backColor: lightColor.mainColor2,
                  textColor: lightColor.textOnMain1,
                  radius: 25,
                  shadow: true,
                }}
              />
            </View>

            {selectedImage && (
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImagePreview} />
            )}

            {cccdData && (
              <View style={styles.cccdDataContainer}>
                <Text style={styles.cccdDataTitle}>Thông tin CCCD đã trích xuất:</Text>
                <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Số CCCD:</Text> {cccdData.number}</Text>
                <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Họ và tên:</Text> {cccdData.fullName}</Text>
                <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Ngày sinh:</Text> {cccdData.dateOfBirth}</Text>
                <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Giới tính:</Text> {cccdData.sex}</Text>
                <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Quốc tịch:</Text> {cccdData.nationality}</Text>
                <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Nơi thường trú:</Text> {cccdData.placeOfResidence}</Text>
                {cccdData.dateOfExpiry && (
                  <Text style={styles.cccdDataItem}><Text style={styles.cccdDataLabel}>Ngày hết hạn:</Text> {cccdData.dateOfExpiry}</Text>
                )}
              </View>
            )}

            {isLoading ? (
              <ActivityIndicator size="large" color={lightColor.mainColor2} /> 
            ) : (
              <CButton
                label="Xác nhận"
                onSubmit={handleCreateAccount}
                style={{
                  width: "85%",
                  height: 50,
                  backColor: lightColor.mainColor2, 
                  textColor: lightColor.textOnMain1,
                  fontSize: 18,
                  radius: 25,
                }}
              />
            )}

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

export default IDVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColor.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  innerContainer: {
    width: '100%',
    alignItems: "center",
  },
  bannerContainer: {
    marginBottom: 20,
  },
  bannerImage: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightColor.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: lightColor.textPrimary,
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: "row",
    width: "85%",
    alignItems: "center",
    marginBottom: 0,
    gap: 10,
  },
  subText: {
    fontSize: 12,
    color: lightColor.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    width: '85%',
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    height: 50,
    justifyContent: "space-between",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: lightColor.mainColor2,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  pickImageTouchable: {
    flex: 1,
    justifyContent: 'center',
  },
  imageButtonText: {
    color: lightColor.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedImagePreview: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 20,
    borderColor: lightColor.border,
    borderWidth: 1,
  },
  cccdDataContainer: {
    width: '85%',
    padding: 15,
    backgroundColor: lightColor.backgroundSecondary,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: lightColor.border,
    shadowColor: lightColor.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cccdDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: lightColor.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  cccdDataItem: {
    fontSize: 14,
    color: lightColor.textSecondary,
    marginBottom: 5,
  },
  cccdDataLabel: {
    fontWeight: 'bold',
    color: lightColor.textPrimary,
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
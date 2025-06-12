import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import { lightColor } from '@/src/styles/Colors';

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState, useEffect } from "react";
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
  Modal,
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
    if (error instanceof Error && error.message.includes("Căn cước công dân đã được sử dụng!")) {
      throw error;
    }
    throw new Error("Căn cước công dân không hợp lệ hoặc không thể đọc được.");
  }
};

const calculateAge = (dateOfBirth: string): number => {
  try {
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
const validateCccdData = (data: CccdDataType): { isValid: boolean; error: string } => {
  // Validate CCCD Number
  if (!data.number || !/^\d{12}$/.test(data.number)) {
    return { isValid: false, error: "Số CCCD phải là 12 chữ số." };
  }

  // Validate Date of Birth
  const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!data.dateOfBirth || !dobRegex.test(data.dateOfBirth)) {
    return { isValid: false, error: "Ngày sinh phải có định dạng DD/MM/YYYY." };
  }
  const [, day, month, year] = data.dateOfBirth.match(dobRegex) || [];
  const dob = new Date(`${year}-${month}-${day}`);
  if (isNaN(dob.getTime())) {
    return { isValid: false, error: "Ngày sinh không hợp lệ." };
  }
  const age = calculateAge(data.dateOfBirth);
  if (age < 18) {
    return { isValid: false, error: "Bạn phải từ 18 tuổi trở lên." };
  }

  // Validate Sex
  if (!data.sex || !["male", "female"].includes(data.sex.toLowerCase())) {
    return { isValid: false, error: "Giới tính phải là 'male' hoặc 'female'." };
  }

  // Validate Date of Expiry
  if (!data.dateOfExpiry || !dobRegex.test(data.dateOfExpiry)) {
    return { isValid: false, error: "Ngày hết hạn phải có định dạng DD/MM/YYYY." };
  }
  const [, expDay, expMonth, expYear] = data.dateOfExpiry.match(dobRegex) || [];
  const expiryDate = new Date(`${expYear}-${expMonth}-${expDay}`);
  if (isNaN(expiryDate.getTime())) {
    return { isValid: false, error: "Ngày hết hạn không hợp lệ." };
  }
  const today = new Date("2025-06-12"); // Current date as per your context
  if (expiryDate <= today) {
    return { isValid: false, error: "Ngày hết hạn phải là một ngày trong tương lai." };
  }

  return { isValid: true, error: "" };
};
const IDVerification = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const [hashtag, setHashtag] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<{ uri: string, type: string } | null>(null);
  const [cccdData, setCccdData] = useState<CccdDataType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [tempCccdData, setTempCccdData] = useState<CccdDataType | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<IDVerificationRouteProp>();
  const emailOrPhone = route.params?.emailOrPhone;
  const password = route.params?.password;
  const codeInputRef = useRef<TextInput>(null);

  // Automatically extract CCCD data when an image is selected
  useEffect(() => {
    const extractData = async () => {
      if (selectedImage) {
        setIsLoading(true);
        try {
          Keyboard.dismiss();
          const extractedData = await extractCCCDData(selectedImage.uri);
          setCccdData(extractedData);
        } catch (error) {
          Alert.alert("Lỗi", error instanceof Error ? error.message : "Không thể trích xuất dữ liệu CCCD.");
          setSelectedImage(null);
        } finally {
          setIsLoading(false);
        }
      }
    };
    extractData();
  }, [selectedImage]);

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
      setSelectedImage({ uri: result.assets[0].uri, type: "image" });
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
      setSelectedImage({ uri: result.assets[0].uri, type: "image" });
    }
  };

  const handleEditCccdData = () => {
    if (cccdData) {
      setTempCccdData({ ...cccdData }); // Copy current CCCD data to temporary state
      setIsEditModalVisible(true);
    }
  };

const handleSaveCccdData = () => {
  if (tempCccdData) {
    const { isValid, error } = validateCccdData(tempCccdData);
    if (!isValid) {
      Alert.alert("Lỗi", error);
      return;
    }
    setCccdData(tempCccdData); 
  }
  setIsEditModalVisible(false);
};

  const handleCancelEdit = () => {
    setTempCccdData(null);
    setIsEditModalVisible(false);
  };

  const handleCreateAccount = async () => {
    if (isLoading) return;

    if (!displayName || !hashtag) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và mã hashtag.");
      return;
    }

    if (!cccdData) {
      Alert.alert("Lỗi", "Vui lòng chọn hoặc chụp ảnh CCCD và xác nhận thông tin.");
      return;
    }

    setIsLoading(true);

    try {
      const hashtagCheck = await restClient.apiClient
        .service("apis/accounts/check-hashtag")
        .create({ hashtag });
      if (hashtagCheck.exists) {
        Alert.alert("Lỗi", "Hashtag đã tồn tại trong hệ thống");
        setIsLoading(false);
        return;
      }

      const age = calculateAge(cccdData.dateOfBirth);
      if (age < 18) {
        Alert.alert("Lỗi", "Bạn phải từ 18 tuổi trở lên để tạo tài khoản!");
        setIsLoading(false);
        return;
      }

      let province = "";
      let district = "";
      let ward = "";
      let street = "";
      let lat: number | null = null;
      let long: number | null = null;

      if (cccdData.placeOfResidence) {
        const addressParts = cccdData.placeOfResidence.split(", ").map((part: string) => part.trim());
        province = addressParts[addressParts.length - 1] || "";
        district = addressParts[addressParts.length - 2] || "";
        ward = addressParts[addressParts.length - 3] || "";
        street = addressParts.slice(0, addressParts.length - 3).join(", ") || "";

        const fullAddressForGeo = `${ward}, ${district}, ${province}`.trim();
        if (fullAddressForGeo) {
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

      const result = await restClient.apiClient
        .service("apis/accounts/create")
        .create({
          email: emailOrPhone,
          password,
          displayName,
          hashtag,
          number: cccdData.number,
          fullName: cccdData.fullName,
          dateOfBirth: cccdData.dateOfBirth,
          sex: cccdData.sex,
          nationality: cccdData.nationality || "Việt Nam",
          placeOfOrigin: cccdData.placeOfOrigin,
          placeOfResidence: cccdData.placeOfResidence,
          dateOfExpiry: cccdData.dateOfExpiry,
          province,
          district,
          ward,
          street,
          lat,
          long,
        });

      if (result.success) {
        Alert.alert("Thành công", "Tài khoản đã được tạo!", [
          { text: "OK", onPress: () => navigation.navigate("PreferenceSelection", { email: emailOrPhone }) },
        ]);
      } else {
        Alert.alert("Lỗi", result.message || "Không thể tạo tài khoản.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsLoading(false);
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
                  radius: 27,
                  shadow: true,
                }}
              />
            </View>

            {selectedImage && (
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImagePreview} />
            )}

            {cccdData && (
              <View style={styles.cccdDataContainer}>
                <View style={styles.cccdHeader}>
                  <Text style={styles.cccdDataTitle}>Thông tin CCCD đã trích xuất:</Text>
                  <CIconButton
                    icon={<Icon name="edit" size={24} color={lightColor.textPrimary} />}
                    onSubmit={handleEditCccdData}
                    style={{
                      width: 40,
                      height: 40,
                      backColor: lightColor.background,
                      radius: 20,
                      shadow: false,
                    }}
                  />
                </View>
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

            {/* Edit Modal */}
            {cccdData && (
              <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleCancelEdit}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Chỉnh sửa thông tin CCCD</Text>
                    <ScrollView style={styles.modalScrollView}>
                      <CInput
                        placeholder="Số CCCD"
                        value={tempCccdData?.number}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, number: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                      <CInput
                        placeholder="Họ và tên"
                        value={tempCccdData?.fullName}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, fullName: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                      <CInput
                        placeholder="Ngày sinh (DD/MM/YYYY)"
                        value={tempCccdData?.dateOfBirth}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, dateOfBirth: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                      <CInput
                        placeholder="Giới tính"
                        value={tempCccdData?.sex}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, sex: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                      <CInput
                        placeholder="Quốc tịch"
                        value={tempCccdData?.nationality}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, nationality: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                      <CInput
                        placeholder="Nơi thường trú"
                        value={tempCccdData?.placeOfResidence}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, placeOfResidence: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                      <CInput
                        placeholder="Ngày hết hạn (DD/MM/YYYY)"
                        value={tempCccdData?.dateOfExpiry}
                        onChangeText={(text) => setTempCccdData((prev) => prev ? { ...prev, dateOfExpiry: text } : prev)}
                        style={{
                          width: "100%",
                          height: 50,
                          backColor: lightColor.background,
                          textColor: lightColor.textPrimary,
                          radius: 25,
                          borderColor: lightColor.mainColor2,
                        }}
                      />
                    </ScrollView>
                    <View style={styles.modalButtonContainer}>
                      <CButton
                        label="Hủy"
                        onSubmit={handleCancelEdit}
                        style={{
                          width: "45%",
                          height: 50,
                          backColor: lightColor.mainColor2,
                          textColor: lightColor.textOnMain1,
                          fontSize: 18,
                          radius: 25,
                        }}
                      />
                      <CButton
                        label="Lưu"
                        onSubmit={handleSaveCccdData}
                        style={{
                          width: "45%",
                          height: 50,
                          backColor: lightColor.mainColor2,
                          textColor: lightColor.textOnMain1,
                          fontSize: 18,
                          radius: 25,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </Modal>
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
  },
  pickImageTouchable: {
    flex: 1,
    justifyContent: 'center',
  },
  imageButtonText: {
    color: lightColor.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  cccdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cccdDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: lightColor.textPrimary,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: lightColor.background,
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColor.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: lightColor.mainColor2,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    width: '45%',
    height: 50,
  },
});
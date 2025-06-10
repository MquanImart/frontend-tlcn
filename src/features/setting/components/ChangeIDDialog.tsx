import CButton from "@/src/shared/components/button/CButton";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CCCDData {
  number: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  dateOfExpiry: string;
}

interface AddressData {
  province: string;
  district: string;
  ward: string;
  street: string;
  placeName: string;
  lat?: number | null;
  long?: number | null;
}

interface ChangeIDDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedCCCD: CCCDData, updatedAddress?: AddressData) => void;
  initialCCCD: CCCDData | null;
  user: any | null;
}

const ChangeIDDialog = ({ visible, onClose, onSave, initialCCCD, user }: ChangeIDDialogProps) => {
  useTheme();
  const [selectedImage, setSelectedImage] = useState<{ uri: string; type: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const extractCCCDData = async (imageUri: string, mimeType: string = "image/jpeg") => {
    try {
      const formData = new FormData();
      formData.append("cccdImage", {
        uri: imageUri,
        type: mimeType,
        name: "cccd.jpg",
      } as any);

      const response = await restClient.apiClient.service("apis/identifications/extract").create(formData);
      if (!response || !response.success) {
        throw new Error(response?.message || "Lỗi server không xác định");
      }

      const cccdData = response.data;
      console.log("Extracted CCCD Data:", cccdData);

      // Create detailed address fields from placeOfResidence
      let province = "";
      let district = "";
      let ward = "";
      let street = "";
      let placeName = "Nơi ở";
      let lat: number | null = null;
      let long: number | null = null;

      if (cccdData.placeOfResidence) {
        const addressParts = cccdData.placeOfResidence.split(", ").map((part: string) => part.trim());
        province = addressParts[addressParts.length - 1] || "";
        district = addressParts[addressParts.length - 2] || "";
        ward = addressParts[addressParts.length - 3] || "";
        street = addressParts[0] || "";

        // Call Nominatim API to get lat, lon
        const fullAddress = `${ward}, ${district}, ${province}`.trim();
        try {
          const nominatimResponse = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`
          );
          const result = nominatimResponse.data[0];
          if (result) {
            lat = parseFloat(result.lat);
            long = parseFloat(result.lon);
          } else {
            console.warn("Không tìm thấy tọa độ cho địa chỉ:", fullAddress);
          }
        } catch (apiError) {
          console.error("Lỗi khi gọi Nominatim API:", apiError);
          Alert.alert("Cảnh báo", "Không thể lấy tọa độ địa chỉ. Tiếp tục mà không có lat/long.");
        }
      }

      return {
        cccd: {
          number: cccdData.number || "",
          fullName: cccdData.fullName || "",
          dateOfBirth: cccdData.dateOfBirth || "",
          sex: cccdData.sex || "",
          nationality: cccdData.nationality || "",
          placeOfOrigin: cccdData.placeOfOrigin || "",
          placeOfResidence: cccdData.placeOfResidence || "",
          dateOfExpiry: cccdData.dateOfExpiry || "",
        },
        address: {
          province,
          district,
          ward,
          street,
          placeName,
          lat,
          long,
        },
      };
    } catch (error) {
      console.error("Error extracting CCCD:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Căn cước công dân không hợp lệ");
      } else {
        throw new Error("Căn cước công dân không hợp lệ");
      }
    }
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Alert.alert("Lỗi", "Vui lòng chọn hoặc chụp ảnh CCCD mới.");
      return;
    }

    if (!user || !user._id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }

    setIsLoading(true);

    try {
      // Extract CCCD data and address
      const extractedData = await extractCCCDData(selectedImage.uri);
      const updatedCCCD = extractedData.cccd;
      const updatedAddress = extractedData.address;

      // Check if user already has CCCD
      let identificationId = null;
      let isExistingCCCD = false;
      if (user.identification && initialCCCD && initialCCCD.number) {
        identificationId = user.identification; // Get ID from user.identification
        if (initialCCCD.number === updatedCCCD.number) {
          isExistingCCCD = true;
        }
      }

      // Prepare CCCD data
      const cccdUpdateData = {
        number: updatedCCCD.number,
        fullName: updatedCCCD.fullName,
        dateOfBirth: updatedCCCD.dateOfBirth,
        sex: updatedCCCD.sex,
        nationality: updatedCCCD.nationality,
        placeOfOrigin: updatedCCCD.placeOfOrigin,
        placeOfResidence: updatedCCCD.placeOfResidence,
        dateOfExpiry: updatedCCCD.dateOfExpiry,
      };

      // Update or create new CCCD
      let cccdResponse;
      if (identificationId && isExistingCCCD) {
        // Update existing CCCD
        cccdResponse = await restClient.apiClient
          .service("apis/identifications")
          .patch(identificationId, cccdUpdateData);
      } else {
        // Create new CCCD
        const formData = new FormData();
        formData.append("cccdImage", {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: "cccd.jpg",
        } as any);
        formData.append("userId", user._id);

        cccdResponse = await restClient.apiClient
          .service("apis/identifications")
          .create(formData);

        // Update user.identification
        if (cccdResponse.success && cccdResponse.data._id) {
          await restClient.apiClient
            .service("users")
            .patch(user._id, { identification: cccdResponse.data._id });
        }
      }

      if (!cccdResponse.success) {
        throw new Error(cccdResponse.message || "Không thể cập nhật/tạo CCCD.");
      }

      // Check if address exists
      let addressId = null;
      if (user.address) {
        addressId = user.address; // Get ID from user.address
      }

      // Prepare address data
      const addressUpdateData = {
        province: updatedAddress.province,
        district: updatedAddress.district,
        ward: updatedAddress.ward,
        street: updatedAddress.street,
        placeName: updatedAddress.placeName,
        lat: updatedAddress.lat,
        long: updatedAddress.long,
        userId: user._id,
      };

      // Update or create new address
      let addressResponse;
      if (addressId) {
        // Update existing address
        addressResponse = await restClient.apiClient
          .service("apis/addresses")
          .patch(addressId, addressUpdateData);
      } else {
        // Create new address
        addressResponse = await restClient.apiClient
          .service("apis/addresses")
          .create(addressUpdateData);

        // Update user.address
        if (addressResponse.success && addressResponse.data._id) {
          await restClient.apiClient
            .service("users")
            .patch(user._id, { address: addressResponse.data._id });
        }
      }

      if (!addressResponse.success) {
        throw new Error(addressResponse.message || "Không thể cập nhật/tạo địa chỉ.");
      }

      onSave(updatedCCCD, updatedAddress);
      Alert.alert(
        "Thành công",
        isExistingCCCD
          ? "Căn cước công dân và địa chỉ đã được cập nhật!"
          : "Căn cước công dân và địa chỉ đã được tạo mới!"
      );
      setSelectedImage(null);
      onClose();
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to convert sex to Vietnamese
  const getSexInVietnamese = (sex: string) => {
    return sex === "male" ? "Nam" : sex === "female" ? "Nữ" : sex;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.dialog, { backgroundColor: Color.background }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: Color.textPrimary }]}>Thay đổi căn cước công dân</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color={Color.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Display current CCCD information */}
          {initialCCCD ? (
            <View style={styles.currentCCCD}>
              <Text style={[styles.label, { color: Color.textPrimary }]}>Thông tin hiện tại:</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Số CCCD: {initialCCCD.number}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Họ tên: {initialCCCD.fullName}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Ngày sinh: {initialCCCD.dateOfBirth}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Giới tính: {getSexInVietnamese(initialCCCD.sex)}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Quốc tịch: {initialCCCD.nationality}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Nơi sinh: {initialCCCD.placeOfOrigin}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Nơi cư trú: {initialCCCD.placeOfResidence}</Text>
              <Text style={[styles.info, { color: Color.textSecondary }]}>Ngày hết hạn: {initialCCCD.dateOfExpiry}</Text>
            </View>
          ) : (
            <Text style={[styles.info, { color: Color.textSecondary }]}>Chưa có thông tin CCCD.</Text>
          )}

          {/* Select or take new CCCD photo */}
          <Text style={[styles.label, { color: Color.textPrimary }]}>Tải lên CCCD mới:</Text>
          <View style={styles.tools}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handlePickImage}
              disabled={isLoading}
            >
              <Ionicons name="image-outline" size={34} color={Color.mainColor2} />
              <Text style={[styles.toolText, { color: Color.textPrimary }]}>Ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handleTakePhoto}
              disabled={isLoading}
            >
              <Ionicons name="camera-outline" size={34} color={Color.mainColor2} />
              <Text style={[styles.toolText, { color: Color.textPrimary }]}>Chụp</Text>
            </TouchableOpacity>
          </View>

          {/* Display selected image */}
          {selectedImage && (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
              <TouchableOpacity
                style={[styles.removeImage, { backgroundColor: Color.backgroundTertiary }]}
                onPress={handleRemoveImage}
                disabled={isLoading}
              >
                <Ionicons name="close" size={18} color={Color.textOnMain2} />
              </TouchableOpacity>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <CButton
              label="Hủy"
              onSubmit={onClose}
              style={{
                width: "45%",
                height: 50,
                backColor: "transparent",
                textColor: Color.mainColor2,
                fontSize: 16,
                borderColor: Color.border, // Using 'border' from your colors
                borderWidth: 1,
                radius: 25,
              }}
            />
            <CButton
              label="Lưu"
              onSubmit={handleSave}
              style={{
                width: "45%",
                height: 50,
                backColor: isLoading ? Color.backgroundTertiary : Color.mainColor2, // Using backgroundTertiary for disabled state
                textColor: Color.textOnMain2, // Using textOnMain2 for text on main color button
                fontSize: 16,
                radius: 25,
              }}
              disabled={isLoading}
            />
          </View>

          {isLoading && (
            <ActivityIndicator
              size="large"
              color={Color.mainColor2}
              style={styles.loading}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialog: {
    width: "90%",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  currentCCCD: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
  },
  tools: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  toolButton: {
    alignItems: "center",
  },
  toolText: {
    fontSize: 16,
    marginTop: 4,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 15,
    alignSelf: "center",
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)", // Keeping this as a semi-transparent black for visual consistency for a close button overlay
    borderRadius: 15,
    padding: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  loading: {
    marginTop: 20,
  },
});

export default ChangeIDDialog;
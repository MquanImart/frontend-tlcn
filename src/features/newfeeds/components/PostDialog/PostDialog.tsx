import { Address } from "@/src/interface/interface_reference";
import CButton from "@/src/shared/components/button/CButton";
import getColor from "@/src/styles/Color";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const colors = getColor();

interface PostDialogProps {
  isModalVisible: boolean;
  postContent: string;
  setPostContent: (content: string) => void;
  toggleModal: () => void;
  handlePost: () => void;
  privacy: "Công khai" | "Bạn bè" | "Riêng tư";
  setPrivacy: (privacy: "Công khai" | "Bạn bè" | "Riêng tư") => void;
  handlePickImage: () => void;
  handleTakePhoto: () => void;
  handleRemoveImage: (index: number) => void;
  selectedImages: string[];
  hashtags: string[];
  hashtagInput: string;
  setHashtagInput: (input: string) => void;
  handleAddHashtag: () => void;
  handleRemoveHashtag: (index: number) => void;
  isLoading: boolean;
  location: { coords: { latitude: number; longitude: number } | null; address: Address | null };
  getCurrentLocation: () => void;
  clearLocation: () => void;
  openMapPicker: () => void; // Thêm prop để mở dialog bản đồ
  isMapPickerVisible: boolean; // Thêm prop để kiểm soát dialog bản đồ
  setMapPickerVisible: (visible: boolean) => void; // Thêm prop để đóng dialog
  handleMapPointSelect: (coords: { latitude: number; longitude: number }, address: Address) => void; // Thêm prop xử lý chọn điểm
  MapPickerDialog: React.FC<any>; // Thêm component dialog
  isLocationLoading: boolean;
}

const PostDialog: React.FC<PostDialogProps> = ({
  isModalVisible,
  postContent,
  setPostContent,
  toggleModal,
  handlePost,
  privacy,
  setPrivacy,
  handlePickImage,
  handleTakePhoto,
  handleRemoveImage,
  selectedImages,
  hashtags,
  hashtagInput,
  setHashtagInput,
  handleAddHashtag,
  handleRemoveHashtag,
  isLoading,
  location,
  getCurrentLocation,
  clearLocation,
  openMapPicker,
  isMapPickerVisible,
  setMapPickerVisible,
  handleMapPointSelect,
  MapPickerDialog,
  isLocationLoading,
}) => {
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);

  const togglePrivacyModal = () => setPrivacyModalVisible(!isPrivacyModalVisible);

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "Công khai":
        return <Ionicons name="earth" size={18} color={colors.textColor3} />;
      case "Bạn bè":
        return <Ionicons name="people" size={18} color={colors.textColor3} />;
      case "Riêng tư":
        return <Ionicons name="lock-closed" size={18} color={colors.textColor3} />;
      default:
        return <Ionicons name="earth" size={18} color={colors.textColor3} />;
    }
  };



  return (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.backGround }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textColor1 }]}>Tạo bài viết</Text>
            <TouchableOpacity onPress={toggleModal} disabled={isLoading}>
              <Ionicons name="close" size={24} color={colors.textColor1} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.privacySelector} onPress={togglePrivacyModal} disabled={isLoading}>
            {getPrivacyIcon(privacy)}
            <Text style={[styles.privacyText, { color: colors.textColor1 }]}>{privacy}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textColor3} />
          </TouchableOpacity>

          <Modal visible={isPrivacyModalVisible} transparent animationType="fade">
            <View style={styles.privacyOverlay}>
              <View style={[styles.privacyModal, { backgroundColor: colors.backGround }]}>
                {["Công khai", "Bạn bè", "Riêng tư"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.privacyOption}
                    onPress={() => {
                      setPrivacy(option as "Công khai" | "Bạn bè" | "Riêng tư");
                      togglePrivacyModal();
                    }}
                  >
                    {getPrivacyIcon(option)}
                    <Text style={[styles.privacyOptionText, { color: colors.textColor1 }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          <TextInput
            style={[styles.textInput, { color: colors.textColor1, borderColor: colors.borderColor1 }]}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={colors.textColor3}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            editable={!isLoading}
          />

          {selectedImages.length > 0 && (
            <FlatList
              data={selectedImages}
              horizontal
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => handleRemoveImage(index)}
                    disabled={isLoading}
                  >
                    <Ionicons name="close" size={18} color={colors.textColor2} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <View style={styles.hashtagContainer}>
            <TextInput
              style={[styles.hashtagInput, { color: colors.textColor1 }]}
              placeholder="#hashtag"
              placeholderTextColor={colors.textColor3}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={handleAddHashtag}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={handleAddHashtag} disabled={isLoading}>
              <Ionicons name="add-circle" size={26} color={colors.mainColor1} />
            </TouchableOpacity>
          </View>

          <View style={styles.hashtagList}>
            {hashtags.map((tag, index) => (
              <View key={index} style={styles.hashtagItem}>
                <Text style={styles.hashtagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveHashtag(index)} disabled={isLoading}>
                  <Ionicons name="close-circle" size={18} color={colors.textColor3} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.locationContainer}>
            {location.address ? (
              <View style={styles.locationInfo}>
                <MaterialIcons name="location-on" size={20} color={colors.mainColor1} />
                  <Text style={[styles.locationText, { color: colors.textColor1 }]} numberOfLines={1}>
                  {location.address?.placeName || 
                  `${location.address?.street}, ${location.address?.ward}, ${location.address?.district}, ${location.address?.province}`}
                </Text>
                <TouchableOpacity onPress={clearLocation} disabled={isLoading}>
                  <Ionicons name="close" size={18} color={colors.textColor3} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.locationButtons}>
                <CButton
                  label={isLocationLoading ? "Đang lấy vị trí..." : "Check-in"}
                  onSubmit={getCurrentLocation}
                  disabled={isLoading || isLocationLoading}
                  style={{ width: "48%", height: 40, backColor: colors.borderColor1, textColor: colors.textColor1, radius: 8, fontSize: 14 }}
                />
                <CButton
                  label="Chọn trên bản đồ"
                  onSubmit={openMapPicker}
                  disabled={isLoading}
                  style={{ width: "48%", height: 40, backColor: colors.borderColor1, textColor: colors.textColor1, radius: 8, fontSize: 14 }}
                />
              </View>
            )}
          </View>

          <View style={styles.tools}>
            <TouchableOpacity style={styles.toolButton} onPress={handlePickImage} disabled={isLoading}>
              <Ionicons name="image-outline" size={26} color={colors.textColor3} />
              <Text style={styles.toolText}>Ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={handleTakePhoto} disabled={isLoading}>
              <Ionicons name="camera-outline" size={26} color={colors.textColor3} />
              <Text style={styles.toolText}>Chụp</Text>
            </TouchableOpacity>
          </View>

          <CButton
            label={isLoading ? "Đang đăng..." : "Đăng bài"}
            onSubmit={handlePost}
            disabled={isLoading}
            style={{
              width: "100%",
              height: 50,
              backColor: isLoading ? colors.borderColor1 : colors.mainColor1,
              textColor: colors.textColor2,
              radius: 10,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {isLoading && <ActivityIndicator size="small" color={colors.textColor2} style={styles.loadingIndicator} />}
          </CButton>
        </View>
      </View>

      <MapPickerDialog
        isVisible={isMapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        onConfirm={handleMapPointSelect}
      />
    </Modal>
  );
};

// Styles giữ nguyên như trước
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  dialog: { width: "90%", borderRadius: 15, padding: 20, elevation: 5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  privacySelector: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.borderColor1, marginBottom: 10 },
  privacyText: { fontSize: 14, marginLeft: 8 },
  textInput: { height: 100, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15, textAlignVertical: "top", fontSize: 16 },
  imageWrapper: { position: "relative", marginRight: 10 },
  selectedImage: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  removeImage: { position: "absolute", top: 5, right: 5, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 15, padding: 6 },
  hashtagContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10, borderColor: colors.borderColor1 },
  hashtagInput: { flex: 1, fontSize: 16 },
  tools: { flexDirection: "row", justifyContent: "space-around", marginBottom: 15 },
  toolButton: { alignItems: "center" },
  toolText: { fontSize: 12, marginTop: 4, color: colors.textColor1 },
  privacyOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  privacyModal: { width: "80%", borderRadius: 10, padding: 20 },
  privacyOption: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  privacyOptionText: { fontSize: 14, marginLeft: 10 },
  hashtagList: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  hashtagItem: { flexDirection: "row", alignItems: "center", backgroundColor: colors.borderColor1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 5 },
  hashtagText: { color: colors.textColor1, fontSize: 14, marginRight: 5 },
  loadingIndicator: { marginLeft: 10 },
  locationContainer: { marginBottom: 15 },
  locationInfo: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.borderColor1 },
  locationText: { flex: 1, marginLeft: 8, marginRight: 8 },
  locationButtons: { flexDirection: "row", justifyContent: "space-between" },
});

export default PostDialog;
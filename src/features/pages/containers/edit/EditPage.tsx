import CHeader from "@/src/shared/components/header/CHeader";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo import đúng
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native";
import { Image } from 'expo-image';
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useEditPage } from "./useEditPage";

interface EditPageProps {
  route: RouteProp<PageStackParamList, "EditPage">;
}

const EditPage: React.FC<EditPageProps> = ({ route }) => {
  useTheme();
  const page = route.params.page;
  const navigation = useNavigation<NavigationProp<PageStackParamList>>();

  const {
    pageName,
    setPageName,
    avtUri,
    removeAvatar,
    handleRemoveAvatar,
    address,
    setAddress,
    timeOpen,
    timeClose,
    hobbyOpen,
    setHobbyOpen,
    hobbies,
    selectedHobbies,
    setSelectedHobbies,
    showTimeOpenPicker,
    setShowTimeOpenPicker,
    showTimeClosePicker,
    setShowTimeClosePicker,
    showProvinceModal,
    setShowProvinceModal,
    showDistrictModal,
    setShowDistrictModal,
    showWardModal,
    setShowWardModal,
    provinces,
    districts,
    wards,
    isLoading,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleStreetChange,
    pickImage,
    onTimeOpenChange,
    onTimeCloseChange,
    formatTime,
    handleUpdatePage,
  } = useEditPage(page, navigation);

  const { tabbarPosition, handleScroll } = useScrollTabbar();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <CHeader
        label="Chỉnh sửa Page"
        backPress={() => navigation.goBack()}
        showBackButton={true}
        labelColor={Color.textPrimary} // Sử dụng textPrimary
        iconColor={Color.mainColor2}
      />

      {/* Tên Page */}
      <Text style={styles.sectionTitle}>Tên</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên Page *"
        placeholderTextColor={Color.textTertiary} // Sử dụng textTertiary
        value={pageName}
        onChangeText={setPageName}
        editable={!isLoading}
      />

      {/* Ảnh đại diện */}
      <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={isLoading}>
        {avtUri ? (
          <Image
            source={{ uri: avtUri }}
            style={styles.avatar}
            resizeMode="contain"
            onError={() => {
              handleRemoveAvatar();
              alert("Lỗi tải ảnh đại diện");
            }}
          />
        ) : (
          <Text style={styles.imagePickerText}>Chọn ảnh đại diện</Text>
        )}
      </TouchableOpacity>
      {avtUri && (
        <TouchableOpacity
          style={[styles.removeButton, {backgroundColor: Color.error}]} // Sử dụng Color.error cho màu đỏ
          onPress={handleRemoveAvatar}
          disabled={isLoading}
        >
          <Text style={styles.removeButtonText}>Xóa ảnh đại diện</Text>
        </TouchableOpacity>
      )}

      {/* Địa chỉ */}
      <Text style={styles.sectionTitle}>Địa chỉ</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowProvinceModal(true)}
        disabled={isLoading}
      >
        <Text style={styles.pickerButtonText}>
          {address.province ? address.province : "Chọn tỉnh/thành phố *"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showProvinceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={address.province}
              onValueChange={handleProvinceChange}
              style={styles.modalPicker}
              enabled={!isLoading}
            >
              <Picker.Item label="Chọn tỉnh/thành phố *" value="" />
              {provinces.map((province) => (
                <Picker.Item
                  key={province.code}
                  label={province.name}
                  value={province.code.toString()}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProvinceModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowDistrictModal(true)}
        disabled={districts.length === 0 || isLoading}
      >
        <Text style={styles.pickerButtonText}>
          {address.district ? address.district : "Chọn quận/huyện *"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={address.district}
              onValueChange={handleDistrictChange}
              style={styles.modalPicker}
              enabled={districts.length > 0 && !isLoading}
            >
              <Picker.Item label="Chọn quận/huyện *" value="" />
              {districts.map((district) => (
                <Picker.Item
                  key={district.code}
                  label={district.name}
                  value={district.code.toString()}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDistrictModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowWardModal(true)}
        disabled={wards.length === 0 || isLoading}
      >
        <Text style={styles.pickerButtonText}>
          {address.ward ? address.ward : "Chọn phường/xã *"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showWardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={address.ward}
              onValueChange={handleWardChange}
              style={styles.modalPicker}
              enabled={wards.length > 0 && !isLoading}
            >
              <Picker.Item label="Chọn phường/xã *" value="" />
              {wards.map((ward) => (
                <Picker.Item
                  key={ward.code}
                  label={ward.name}
                  value={ward.code.toString()}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowWardModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={styles.input}
        placeholder="Đường/Phố (tuỳ chọn)"
        placeholderTextColor={Color.textTertiary} // Sử dụng textTertiary
        value={address.street}
        onChangeText={handleStreetChange}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Tên địa điểm (tuỳ chọn)"
        placeholderTextColor={Color.textTertiary} // Sử dụng textTertiary
        value={address.placeName || ""}
        onChangeText={(text) => setAddress({ ...address, placeName: text })}
        editable={!isLoading}
      />

      {/* Hiển thị trạng thái tọa độ */}
      {isLoading ? (
        <Text style={styles.coordinatesText}>Đang tải tọa độ...</Text>
      ) : address.lat && address.long ? (
        <Text style={styles.coordinatesText}>
          Tọa độ: Lat {address.lat.toFixed(6)}, Lon {address.long.toFixed(6)}
        </Text>
      ) : (
        <Text style={styles.coordinatesText}>Không tìm thấy tọa độ</Text>
      )}

      {/* Thời gian hoạt động */}
      <Text style={styles.sectionTitle}>Thời gian hoạt động</Text>
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowTimeOpenPicker(true)}
        disabled={isLoading}
      >
        <Text style={styles.timeText}>{formatTime(timeOpen)}</Text>
      </TouchableOpacity>
      {showTimeOpenPicker && (
        <DateTimePicker
          value={timeOpen || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          onChange={onTimeOpenChange}
          timeZoneName="Asia/Ho_Chi_Minh"
        />
      )}
      <TouchableOpacity
        style={styles.timePicker}
        onPress={() => setShowTimeClosePicker(true)}
        disabled={isLoading}
      >
        <Text style={styles.timeText}>{formatTime(timeClose)}</Text>
      </TouchableOpacity>
      {showTimeClosePicker && (
        <DateTimePicker
          value={timeClose || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          onChange={onTimeCloseChange}
          timeZoneName="Asia/Ho_Chi_Minh"
        />
      )}

      {/* Sở thích */}
      <Text style={styles.sectionTitle}>Sở thích</Text>
      <DropDownPicker
        open={hobbyOpen}
        setOpen={setHobbyOpen}
        value={selectedHobbies}
        setValue={setSelectedHobbies}
        items={hobbies}
        multiple={true}
        min={1}
        showTickIcon
        mode="BADGE"
        placeholder="Chọn sở thích"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listMode="SCROLLVIEW"
        disabled={isLoading}
        // Thêm màu sắc cho DropDownPicker
        textStyle={{ color: Color.textPrimary }}
        labelStyle={{ color: Color.textPrimary }}
        placeholderStyle={{ color: Color.textTertiary }}
        selectedItemLabelStyle={{ color: Color.mainColor2 }}
      />

      {/* Nút cập nhật */}
      <TouchableOpacity
        style={[styles.updateButton, isLoading && styles.disabledButton]}
        onPress={handleUpdatePage}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Color.textOnMain2} /> 
        ) : (
          <Text style={styles.buttonText}>Cập nhật Page</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background, 
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textPrimary, 
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: Color.border, 
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: Color.textPrimary, 
    backgroundColor: Color.backgroundTertiary,
  },
  pickerButton: {
    height: 50,
    borderColor: Color.border, 
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
    backgroundColor: Color.backgroundTertiary,
  },
  pickerButtonText: {
    color: Color.textPrimary, 
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Color.background, 
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: "50%",
  },
  modalPicker: {
    color: Color.textPrimary, 
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: Color.mainColor2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: Color.textOnMain2, 
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePicker: {
    height: 200,
    borderColor: Color.border, 
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: Color.backgroundTertiary, // Thay thế inputBackGround bằng backgroundTertiary
  },
  imagePickerText: {
    color: Color.textTertiary, // Thay thế textColor3 bằng textTertiary
    fontSize: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "contain",
  },
  removeButton: {
    padding: 10,
    borderRadius: 8,
    // backgroundColor được áp dụng inline
    alignItems: "center",
    marginBottom: 15,
  },
  removeButtonText: {
    color: Color.white_white, // Đảm bảo màu trắng cố định cho nút xóa
    fontWeight: "600",
  },
  timePicker: {
    height: 50,
    borderColor: Color.border, // Thay thế borderColor1 bằng border
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
    backgroundColor: Color.backgroundTertiary, // Thay thế inputBackGround bằng backgroundTertiary
  },
  timeText: {
    color: Color.textPrimary, // Thay thế white_contrast bằng textPrimary
    fontSize: 16,
  },
  coordinatesText: {
    color: Color.textPrimary, // Thay thế white_contrast bằng textPrimary
    fontSize: 14,
    marginBottom: 15,
  },
  updateButton: {
    backgroundColor: Color.mainColor2,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: Color.border, // Sử dụng Color.border hoặc một màu xám thích hợp
    opacity: 0.6,
  },
  buttonText: {
    color: Color.textOnMain2, // Sử dụng textOnMain2 cho màu chữ trên nút chính
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Color.border, // Thay thế borderColor1 bằng border
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: Color.backgroundTertiary, // Thay thế inputBackGround bằng backgroundTertiary
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Color.border, // Thay thế borderColor1 bằng border
    backgroundColor: Color.background, // Sửa lỗi chính tả: backGround -> background
  },
});

export default EditPage;
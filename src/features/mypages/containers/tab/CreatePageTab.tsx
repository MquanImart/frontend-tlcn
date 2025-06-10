import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo import đúng
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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
import { useCreatePageTab } from "./useCreatePageTab";

interface CreatePageTabProps {
  userId: string;
  handleScroll: (event: any) => void;
}

const CreatePageTab = ({ userId, handleScroll }: CreatePageTabProps) => {
  useTheme();
  const {
    pageName,
    setPageName,
    avtUri,
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
    pickImage,
    onTimeOpenChange,
    onTimeCloseChange,
    formatTime,
    handleCreatePage,
  } = useCreatePageTab(userId);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Color.background }]}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Text style={[styles.title, { color: Color.textPrimary }]}>Tạo Page Mới</Text>

      {/* Page Name */}
      <TextInput
        style={[styles.input, {
          borderColor: Color.border, // Sử dụng border
          color: Color.textPrimary,
          backgroundColor: Color.backgroundTertiary, // inputBackground có thể được thay thế bằng backgroundTertiary
        }]}
        placeholder="Tên Page *"
        placeholderTextColor={Color.textTertiary} // Sử dụng textTertiary cho placeholder
        value={pageName}
        onChangeText={setPageName}
        editable={!isLoading}
      />

      {/* Avatar */}
      <TouchableOpacity style={[styles.imagePicker, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]} onPress={pickImage} disabled={isLoading}>
        {avtUri ? (
          <Image source={{ uri: avtUri }} style={styles.avatar} />
        ) : (
          <Text style={[styles.imagePickerText, { color: Color.textTertiary }]}>Chọn ảnh đại diện</Text> // Sử dụng textTertiary
        )}
      </TouchableOpacity>

      {/* Address */}
      <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>Địa chỉ</Text>
      <TouchableOpacity
        style={[styles.pickerButton, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]}
        onPress={() => setShowProvinceModal(true)}
        disabled={isLoading}
      >
        <Text style={[styles.pickerButtonText, { color: Color.textPrimary }]}>
          {address.province
            ? provinces.find((p) => p.code === parseInt(address.province))?.name
            : "Chọn tỉnh/thành phố *"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showProvinceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProvinceModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Color.backgroundSecondary }]}>
            <Picker
              selectedValue={address.province}
              onValueChange={(itemValue) => handleProvinceChange(itemValue)}
              style={[styles.modalPicker, { color: Color.textPrimary }]}
              enabled={!isLoading}
            >
              <Picker.Item label="Chọn tỉnh/thành phố *" value="" color={Color.textSecondary}/>
              {provinces.map((province) => (
                <Picker.Item
                  key={province.code}
                  label={province.name}
                  value={province.code.toString()}
                  color={Color.textPrimary}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Color.mainColor2 }]}
              onPress={() => setShowProvinceModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: Color.textOnMain2 }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.pickerButton, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]}
        onPress={() => setShowDistrictModal(true)}
        disabled={districts.length === 0 || isLoading}
      >
        <Text style={[styles.pickerButtonText, { color: Color.textPrimary }]}>
          {address.district
            ? districts.find((d) => d.code === parseInt(address.district))?.name
            : "Chọn quận/huyện *"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Color.backgroundSecondary }]}>
            <Picker
              selectedValue={address.district}
              onValueChange={(itemValue) => handleDistrictChange(itemValue)}
              style={[styles.modalPicker, { color: Color.textPrimary }]}
              enabled={districts.length > 0 && !isLoading}
            >
              <Picker.Item label="Chọn quận/huyện *" value="" color={Color.textSecondary}/>
              {districts.map((district) => (
                <Picker.Item
                  key={district.code}
                  label={district.name}
                  value={district.code.toString()}
                  color={Color.textPrimary}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Color.mainColor2 }]}
              onPress={() => setShowDistrictModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: Color.textOnMain2 }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={[styles.pickerButton, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]}
        onPress={() => setShowWardModal(true)}
        disabled={wards.length === 0 || isLoading}
      >
        <Text style={[styles.pickerButtonText, { color: Color.textPrimary }]}>
          {address.ward
            ? wards.find((w) => w.code === parseInt(address.ward))?.name
            : "Chọn phường/xã *"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showWardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWardModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: Color.backgroundSecondary }]}>
            <Picker
              selectedValue={address.ward}
              onValueChange={(itemValue) => handleWardChange(itemValue)}
              style={[styles.modalPicker, { color: Color.textPrimary }]}
              enabled={wards.length > 0 && !isLoading}
            >
              <Picker.Item label="Chọn phường/xã *" value="" color={Color.textSecondary}/>
              {wards.map((ward) => (
                <Picker.Item
                  key={ward.code}
                  label={ward.name}
                  value={ward.code.toString()}
                  color={Color.textPrimary}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: Color.mainColor2 }]}
              onPress={() => setShowWardModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: Color.textOnMain2 }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        style={[styles.input, {
          borderColor: Color.border,
          color: Color.textPrimary,
          backgroundColor: Color.backgroundTertiary,
        }]}
        placeholder="Đường/Phố (tùy chọn)"
        placeholderTextColor={Color.textTertiary}
        value={address.street}
        onChangeText={(text) => setAddress({ ...address, street: text })}
        editable={!isLoading}
      />
      <TextInput
        style={[styles.input, {
          borderColor: Color.border,
          color: Color.textPrimary,
          backgroundColor: Color.backgroundTertiary,
        }]}
        placeholder="Tên địa điểm (tùy chọn)"
        placeholderTextColor={Color.textTertiary}
        value={address.placeName}
        onChangeText={(text) => setAddress({ ...address, placeName: text })}
        editable={!isLoading}
      />

      {address.lat && address.long && (
        <Text style={[styles.coordinatesText, { color: Color.textSecondary }]}>
          Tọa độ: Lat {address.lat.toFixed(6)}, Long {address.long.toFixed(6)}
        </Text>
      )}

      {/* Operating Hours */}
      <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>Thời gian hoạt động</Text>
      <TouchableOpacity
        style={[styles.timePicker, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]}
        onPress={() => setShowTimeOpenPicker(true)}
        disabled={isLoading}
      >
        <Text style={[styles.timeText, { color: Color.textPrimary }]}>{formatTime(timeOpen)}</Text>
      </TouchableOpacity>
      {showTimeOpenPicker && (
        <DateTimePicker
          value={timeOpen || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          onChange={onTimeOpenChange}
          textColor={Platform.OS === "ios" ? Color.textPrimary : undefined}
        />
      )}
      <TouchableOpacity
        style={[styles.timePicker, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]}
        onPress={() => setShowTimeClosePicker(true)}
        disabled={isLoading}
      >
        <Text style={[styles.timeText, { color: Color.textPrimary }]}>{formatTime(timeClose)}</Text>
      </TouchableOpacity>
      {showTimeClosePicker && (
        <DateTimePicker
          value={timeClose || new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          onChange={onTimeCloseChange}
          textColor={Platform.OS === "ios" ? Color.textPrimary : undefined}
        />
      )}

      {/* Hobbies */}
      <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>Sở thích</Text>
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
        style={[styles.dropdown, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundTertiary,
        }]}
        dropDownContainerStyle={[styles.dropdownContainer, {
          borderColor: Color.border,
          backgroundColor: Color.backgroundSecondary,
        }]}
        textStyle={{ color: Color.textPrimary }}
        placeholderStyle={{ color: Color.textTertiary }}
        selectedItemLabelStyle={{ fontWeight: "bold", color: Color.mainColor2 }}
        selectedItemContainerStyle={{ backgroundColor: Color.backgroundSelected }} // Sử dụng backgroundSelected
        listItemLabelStyle={{ color: Color.textPrimary }}
        disabled={isLoading}
        listMode="SCROLLVIEW"
      />

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: Color.mainColor2 }, isLoading && styles.disabledButton]}
        onPress={handleCreatePage}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Color.textOnMain2} />
        ) : (
          <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Tạo Page</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  pickerButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
  },
  pickerButtonText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Vẫn giữ màu overlay cố định
  },
  modalContent: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: "50%",
  },
  modalPicker: {},
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePicker: {
    height: 250,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    fontSize: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  timePicker: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
  },
  coordinatesText: {
    fontSize: 14,
    marginBottom: 15,
  },
  createButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: Color.border, // Sử dụng màu border cho nút bị disabled
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
  },
});

export default CreatePageTab;
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Text style={styles.title}>Tạo Page Mới</Text>

      {/* Page Name */}
      <TextInput
        style={styles.input}
        placeholder="Tên Page *"
        placeholderTextColor={Color.textColor3}
        value={pageName}
        onChangeText={setPageName}
        editable={!isLoading}
      />

      {/* Avatar */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={isLoading}>
        {avtUri ? (
          <Image source={{ uri: avtUri }} style={styles.avatar} />
        ) : (
          <Text style={styles.imagePickerText}>Chọn ảnh đại diện</Text>
        )}
      </TouchableOpacity>

      {/* Address */}
      <Text style={styles.sectionTitle}>Địa chỉ</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowProvinceModal(true)}
        disabled={isLoading}
      >
        <Text style={styles.pickerButtonText}>
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
          <View style={styles.modalContent}>
            <Picker
              selectedValue={address.province}
              onValueChange={(itemValue) => handleProvinceChange(itemValue)}
              style={styles.modalPicker}
              enabled={!isLoading}
            >
              <Picker.Item label="Chọn tỉnh/thành phố *" value="" color={Color.white_contrast}/>
              {provinces.map((province) => (
                <Picker.Item
                  key={province.code}
                  label={province.name}
                  value={province.code.toString()}
                  color={Color.white_contrast}
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
          <View style={styles.modalContent}>
            <Picker
              selectedValue={address.district}
              onValueChange={(itemValue) => handleDistrictChange(itemValue)}
              style={styles.modalPicker}
              enabled={districts.length > 0 && !isLoading}
            >
              <Picker.Item label="Chọn quận/huyện *" value="" color={Color.white_contrast}/>
              {districts.map((district) => (
                <Picker.Item
                  key={district.code}
                  label={district.name}
                  value={district.code.toString()}
                  color={Color.white_contrast}
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
          <View style={styles.modalContent}>
            <Picker
              selectedValue={address.ward}
              onValueChange={(itemValue) => handleWardChange(itemValue)}
              style={styles.modalPicker}
              enabled={wards.length > 0 && !isLoading}
            >
              <Picker.Item label="Chọn phường/xã *" value="" color={Color.white_contrast}/>
              {wards.map((ward) => (
                <Picker.Item
                  key={ward.code}
                  label={ward.name}
                  value={ward.code.toString()}
                  color={Color.white_contrast}
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
        placeholder="Đường/Phố (tùy chọn)"
        placeholderTextColor={Color.textColor3}
        value={address.street}
        onChangeText={(text) => setAddress({ ...address, street: text })}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Tên địa điểm (tùy chọn)"
        placeholderTextColor={Color.textColor3}
        value={address.placeName}
        onChangeText={(text) => setAddress({ ...address, placeName: text })}
        editable={!isLoading}
      />

      {address.lat && address.long && (
        <Text style={styles.coordinatesText}>
          Tọa độ: Lat {address.lat.toFixed(6)}, Long {address.long.toFixed(6)}
        </Text>
      )}

      {/* Operating Hours */}
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
          textColor="black"
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
          textColor="black"
        />
      )}

      {/* Hobbies */}
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
      />

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.disabledButton]}
        onPress={handleCreatePage}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Color.textColor2} />
        ) : (
          <Text style={styles.buttonText}>Tạo Page</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Color.white_contrast,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.white_contrast,
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: Color.borderColor1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: Color.white_contrast,
    backgroundColor: Color.inputBackGround,
  },
  pickerButton: {
    height: 50,
    borderColor: Color.borderColor1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
    backgroundColor: Color.inputBackGround,
  },
  pickerButtonText: {
    color: Color.white_contrast,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Color.backGround,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: "50%",
  },
  modalPicker: {
    color: Color.white_contrast,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: Color.mainColor1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: Color.textColor2,
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePicker: {
    height: 100,
    borderColor: Color.borderColor1,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: Color.inputBackGround,
  },
  imagePickerText: {
    color: Color.textColor3,
    fontSize: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  timePicker: {
    height: 50,
    borderColor: Color.borderColor1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
    backgroundColor: Color.inputBackGround,
  },
  timeText: {
    color: Color.white_contrast,
    fontSize: 16,
  },
  coordinatesText: {
    color: Color.white_contrast,
    fontSize: 14,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: Color.mainColor1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: Color.borderColor1,
    opacity: 0.6,
  },
  buttonText: {
    color: Color.textColor2,
    fontSize: 18,
    fontWeight: "bold",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: Color.inputBackGround,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Color.borderColor1,
    backgroundColor: Color.backGround,
  },
});

export default CreatePageTab;
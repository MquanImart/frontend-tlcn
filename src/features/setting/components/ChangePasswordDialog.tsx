import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm AsyncStorage
import getColor from "@/src/styles/Color";
import restClient from "@/src/shared/services/RestClient";

const Color = getColor();

interface ChangePasswordDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: ( oldPassword: string, newPassword: string) => Promise<void>; // Cập nhật để nhận accountId
  loading: boolean;
}

const accountClient = restClient.apiClient.service("apis/accounts");

const ChangePasswordDialog = ({ visible, onClose, onSave, loading }: ChangePasswordDialogProps) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null); // State để lưu accountId

  // State để kiểm soát ẩn/hiện mật khẩu
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Lấy accountId từ AsyncStorage khi component mount
  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const id = await AsyncStorage.getItem('accountId'); // Giả sử accountId được lưu với key 'accountId'
        if (id) {
          setAccountId(id);
          console.log("Account ID:", id); // Kiểm tra xem accountId có được lấy thành công không
        } else {
          setPasswordError("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy accountId từ AsyncStorage:", error);
        setPasswordError("Lỗi hệ thống, vui lòng thử lại.");
      }
    };

    if (visible) {
      fetchAccountId(); // Chỉ lấy accountId khi modal hiển thị
    }
  }, [visible]);

  const handleSave = async () => {
    if (!accountId) {
      setPasswordError("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Kiểm tra mật khẩu cũ
      const passWordCheck = await restClient.apiClient
        .service("apis/accounts/compare-password")
        .create({
          idAccount: accountId, // Truyền accountId thay vì chỉ password
          password: oldPassword,
        });

      if (!passWordCheck.success) {
        setPasswordError("Mật khẩu cũ không chính xác");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
        return;
      }

      if (!oldPassword || !newPassword || !confirmPassword) {
        setPasswordError("Vui lòng điền đầy đủ các trường");
        return;
      }

      // Gọi hàm onSave với accountId
      await onSave( oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      onClose();
    } catch (err: any) {
      setPasswordError(err.message || "Lỗi không xác định");
    }
  };

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setAccountId(null); // Reset accountId khi đóng modal
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>

            {/* Trường mật khẩu cũ */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Mật khẩu cũ"
                placeholderTextColor={Color.textColor3}
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowOldPassword(!showOldPassword)}
              >
                <Ionicons
                  name={showOldPassword ? "eye-off" : "eye"}
                  size={24}
                  color={Color.mainColor1}
                />
              </TouchableOpacity>
            </View>

            {/* Trường mật khẩu mới */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Mật khẩu mới"
                placeholderTextColor={Color.textColor3}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={24}
                  color={Color.mainColor1}
                />
              </TouchableOpacity>
            </View>

            {/* Trường xác nhận mật khẩu */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor={Color.textColor3}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color={Color.mainColor1}
                />
              </TouchableOpacity>
            </View>

            {passwordError && (
              <Text style={styles.errorText}>{passwordError}</Text>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.textColor3 }]}
                onPress={handleClose}
              >
                <Text style={styles.modalButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.mainColor1 }]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: Color.white_homologous,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.mainColor1,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: Color.textColor3,
    borderRadius: 8,
    padding: 10,
    paddingRight: 40,
    fontSize: 16,
    backgroundColor: Color.white_homologous,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: Color.white_homologous,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordDialog;
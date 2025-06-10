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
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import restClient from "@/src/shared/services/RestClient";

interface ChangePasswordDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (oldPassword: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

const accountClient = restClient.apiClient.service("apis/accounts");

const ChangePasswordDialog = ({ visible, onClose, onSave, loading }: ChangePasswordDialogProps) => {
  useTheme();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const id = await AsyncStorage.getItem('accountId');
        if (id) {
          // Remove quotes if present
          const cleanId = id.replace(/"/g, '');
          setAccountId(cleanId);
          console.log("Account ID:", cleanId);
        } else {
          setPasswordError("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy accountId từ AsyncStorage:", error);
        setPasswordError("Lỗi hệ thống, vui lòng thử lại.");
      }
    };

    if (visible) {
      fetchAccountId();
    }
  }, [visible]);

  const handleSave = async () => {
    if (!accountId) {
      setPasswordError("Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      // Validate inputs first to avoid unnecessary API calls
      if (!oldPassword || !newPassword || !confirmPassword) {
        setPasswordError("Vui lòng điền đầy đủ các trường");
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
        return;
      }

      // Check old password
      const passWordCheck = await restClient.apiClient
        .service("apis/accounts/compare-password")
        .create({
          idAccount: accountId,
          password: oldPassword,
        });

      if (!passWordCheck.success) {
        setPasswordError("Mật khẩu cũ không chính xác");
        return;
      }

      await onSave(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      onClose();
    } catch (err: any) {
      setPasswordError(err.message || "Đã xảy ra lỗi không xác định.");
    }
  };

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setAccountId(null);
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
          <View style={[styles.modalContainer, { backgroundColor: Color.background }]}>
            <Text style={[styles.modalTitle, { color: Color.textPrimary }]}>Đổi mật khẩu</Text>

            {/* Old password field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.modalInput, { borderColor: Color.border, color: Color.textPrimary, backgroundColor: Color.backgroundSecondary }]}
                placeholder="Mật khẩu cũ"
                placeholderTextColor={Color.textSecondary}
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
                  color={Color.mainColor2}
                />
              </TouchableOpacity>
            </View>

            {/* New password field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.modalInput, { borderColor: Color.border, color: Color.textPrimary, backgroundColor: Color.backgroundSecondary }]}
                placeholder="Mật khẩu mới"
                placeholderTextColor={Color.textSecondary}
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
                  color={Color.mainColor2}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm new password field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.modalInput, { borderColor: Color.border, color: Color.textPrimary, backgroundColor: Color.backgroundSecondary }]}
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor={Color.textSecondary}
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
                  color={Color.mainColor2}
                />
              </TouchableOpacity>
            </View>

            {passwordError && (
              <Text style={[styles.errorText, { color: Color.error }]}>{passwordError}</Text>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.backgroundTertiary }]}
                onPress={handleClose}
              >
                {/* Changed to wrap the label in a Text component */}
                <Text style={[styles.modalButtonText, { color: Color.textPrimary }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Color.mainColor2 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {/* Changed to wrap the label in a Text component */}
                <Text style={[styles.modalButtonText, { color: Color.textOnMain2 }]}>
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    borderRadius: 8,
    padding: 10,
    paddingRight: 40,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  errorText: {
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordDialog;
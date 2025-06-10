import React, { useState } from "react";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, TextInput, Button, StyleSheet, Modal, Text, TouchableOpacity } from "react-native";

interface RenameGroupModalProps {
  visible: boolean;
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

const RenameGroupModal: React.FC<RenameGroupModalProps> = ({ visible, currentName, onRename, onCancel }) => {
  useTheme();
  const [newName, setNewName] = useState(currentName);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: Color.backgroundSecondary }]}>
          <Text style={[styles.title, { color: Color.textPrimary }]}>Đổi tên nhóm</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: Color.border,
                color: Color.textPrimary,
                backgroundColor: Color.backgroundTertiary,
              },
            ]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Nhập tên nhóm mới"
            placeholderTextColor={Color.textTertiary}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonWrapper, { backgroundColor: Color.mainColor2 }]}
              onPress={() => onRename(newName)}
            >
              <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonWrapper, { backgroundColor: Color.error }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default RenameGroupModal;
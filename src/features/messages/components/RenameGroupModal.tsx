import React, { useState } from "react";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, TextInput, Button, StyleSheet, Modal, Text } from "react-native";

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
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Đổi tên nhóm</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Nhập tên nhóm mới"
          />
          <View style={styles.buttonContainer}>
            <Button title="Xác nhận" onPress={() => onRename(newName)} />
            <Button title="Hủy" onPress={onCancel} color="red" />
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Làm mờ nền
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
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
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default RenameGroupModal;

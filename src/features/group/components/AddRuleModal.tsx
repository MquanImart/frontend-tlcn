import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface AddRuleModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddRule: (rule: string) => void;
}

const AddRuleModal: React.FC<AddRuleModalProps> = ({
  isVisible,
  onClose,
  onAddRule,
}) => {
  useTheme();
  const [newRule, setNewRule] = useState("");

  const handleAdd = () => {
    if (newRule.trim() !== "") {
      onAddRule(newRule.trim());
      setNewRule("");
      onClose();
    }
  };

  const handleCancel = () => {
    setNewRule(""); 
    onClose(); 
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>THÊM QUY ĐỊNH</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập quy định mới tại đây"
            placeholderTextColor={Color.textColor3}
            value={newRule}
            onChangeText={setNewRule}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>HỦY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.addButtonText}>THÊM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddRuleModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#F5F5F5",
    marginBottom: 15,
    fontSize: 14,
    color: Color.textColor1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  addButton: {
    width: "48%",
    height: 45,
    backgroundColor: Color.mainColor1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    width: "48%",
    height: 45,
    backgroundColor: Color.textColor3,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
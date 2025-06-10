import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ticket } from "@/src/interface/interface_reference";

interface AddTicketModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTicket: (ticket: Omit<Ticket, "_id">) => void;
  pageId?: string;
}

const AddTicketModal: React.FC<AddTicketModalProps> = ({ visible, onClose, onAddTicket, pageId }) => {
  useTheme();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleAddTicket = () => {
    if (!name || !price) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert("Lỗi", "Giá vé phải là một số hợp lệ!");
      return;
    }

    const newTicket: Omit<Ticket, "_id"> = {
      name,
      price: parsedPrice,
      description,
      ...(pageId && { pageId }), 
    };

    onAddTicket(newTicket);
    setName("");
    setPrice("");
    setDescription("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>THÊM VÉ</Text>

          <Text style={styles.label}>TÊN VÉ</Text>
          <TextInput
            style={[styles.input, {color: Color.textPrimary}]}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên vé"
            placeholderTextColor={Color.textTertiary}
          />

          <Text style={styles.label}>GIÁ VÉ</Text>
          <TextInput
            style={[styles.input, {color: Color.textPrimary}]}
            value={price}
            onChangeText={setPrice}
            placeholder="Nhập giá vé"
            placeholderTextColor={Color.textTertiary}
            keyboardType="numeric"
          />

          <Text style={styles.label}>MÔ TẢ (không bắt buộc)</Text>
          <TextInput
            style={[styles.input, {color: Color.textPrimary}]}
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập mô tả"
            placeholderTextColor={Color.textTertiary}
            multiline
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAddTicket}>
            <Text style={styles.addButtonText}>THÊM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={Color.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddTicketModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: Color.background,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: Color.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textPrimary,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 5,
    color: Color.textPrimary,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: Color.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Color.backgroundTertiary,
  },
  addButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Color.mainColor2,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: Color.textOnMain2,
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
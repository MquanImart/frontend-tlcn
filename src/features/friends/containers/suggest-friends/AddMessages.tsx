import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

interface MessageModalProps {
    visible: boolean;
    onClose: () => void;
    onSend: (value: string) => void;
}

const MessageModal = ({ visible, onClose, onSend }:  MessageModalProps) => {
    const [message, setMessage] = useState("");

    return (
        <Modal visible={visible} transparent animationType="fade">
            {/* Nền mờ */}
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Nhập tin nhắn</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập tin nhắn..."
                        value={message}
                        onChangeText={setMessage}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => onSend(message)}>
                            <Text style={styles.buttonText}>Gửi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalContainer: { width: 300, backgroundColor: "white", padding: 20, borderRadius: 10, elevation: 5 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 15 },
    
    buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
    button: { backgroundColor: "#007AFF", padding: 10, borderRadius: 5, flex: 1, alignItems: "center", marginHorizontal: 5 },
    cancelButton: { backgroundColor: "#FF3B30" },
    buttonText: { color: "white", fontWeight: "bold" }
});

export default MessageModal;
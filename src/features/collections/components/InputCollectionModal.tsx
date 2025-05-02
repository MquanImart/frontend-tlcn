import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";

interface InputCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onInput: (value: string) => void;
    initialName: string;
    label: string;
}

const InputCollectionModal = ({ visible, onClose, onInput, initialName, label } : InputCollectionModalProps) => {
    const [newName, setNewName] = useState(initialName);

    const handleInput = () => {
        if (newName.trim()) {
            onInput(newName);
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{label}</Text>
                    
                    <TextInput
                        style={styles.input}
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="Nhập tên mới..."
                    />

                    <View style={styles.buttonContainer}>
                        <Button title="Hủy" onPress={onClose} />
                        <Button title="Lưu" onPress={handleInput} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});

export default InputCollectionModal;

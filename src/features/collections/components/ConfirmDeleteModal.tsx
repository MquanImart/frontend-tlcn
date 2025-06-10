import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";


interface ConfirmDeleteModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    collectionName: string;
}

const ConfirmDeleteModal = ({ visible, onClose, onConfirm, collectionName }: ConfirmDeleteModalProps) => {
    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Xác nhận xóa</Text>
                    <Text style={styles.message}>
                        {`Bạn có chắc chắn muốn xóa bộ sưu tập ${collectionName} không?`}
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Button title="Hủy" onPress={onClose} />
                        <Button title="Xóa" onPress={onConfirm} color="red" />
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
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
});

export default ConfirmDeleteModal;

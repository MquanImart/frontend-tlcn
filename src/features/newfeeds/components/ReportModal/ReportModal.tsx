import React from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface ReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedReason: string;
  setSelectedReason: (reason: string) => void;
  onSubmit: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isVisible,
  onClose,
  selectedReason,
  setSelectedReason,
  onSubmit,
}) => {
  useTheme();
  const reportReasons = [
    "Nội dung không phù hợp",
    "Thông tin sai lệch",
    "Spam",
    "Lạm dụng"
  ];

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: Color.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Color.textPrimary }]}>
              Báo cáo bài viết
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Color.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Report Reasons */}
          {reportReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.reasonButton,
                {
                  backgroundColor:
                    selectedReason === reason
                      ? Color.mainColor2
                      : Color.background,
                  borderColor:
                    selectedReason === reason
                      ? Color.mainColor2
                      : Color.border,
                },
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <Text
                style={[
                  styles.reasonText,
                  {
                    color:
                      selectedReason === reason
                        ? Color.textOnMain2
                        : Color.textPrimary,
                  },
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Action Buttons */}
          <CButton
            label="Gửi"
            onSubmit={onSubmit}
            style={{
              width: "100%",
              height: 50,
              backColor: Color.mainColor2,
              textColor: Color.textOnMain2,
              fontSize: 16,
              fontWeight: "bold",
              radius: 8,
              flex_direction: "row",
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  reasonButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
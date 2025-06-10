import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MemberRequestItemProps {
  name: string;
  avatar: string;
  requestDate: string;
  onAccept: () => void;
  onReject: () => void;
}

const MemberRequestItem: React.FC<MemberRequestItemProps> = ({
  name,
  avatar,
  requestDate,
  onAccept,
  onReject,
}) => {
  useTheme();
  return (
    <View style={[
      styles.container,
      { backgroundColor: Color.background, borderColor: Color.border },
      styles.shadowEffect
    ]}>
      {/* Avatar & Thông tin */}
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={[styles.avatar, { borderColor: Color.mainColor2 }]} />
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={[styles.name, { color: Color.textPrimary }]}>{name}</Text>
            <TouchableOpacity style={[styles.button, styles.rejectButton, { backgroundColor: Color.mainColor2 }]} onPress={onReject}>
              <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Từ chối</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={[styles.date, { color: Color.textSecondary }]}>Ngày gửi: {requestDate}</Text>
            <TouchableOpacity style={[styles.button, styles.acceptButton, { backgroundColor: Color.mainColor2 }]} onPress={onAccept}>
              <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Duyệt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MemberRequestItem;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 15,
  },
  shadowEffect: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
  },
  infoContainer: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
  },
  button: {
    width: 80,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  rejectButton: {
    // This style block is empty here because the background color is applied inline
  },
  acceptButton: {
    // This style block is empty here because the background color is applied inline
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});
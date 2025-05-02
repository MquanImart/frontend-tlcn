import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import getColor from "@/src/styles/Color";

const Color = getColor();

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
  return (
    <View style={[styles.container, styles.shadowEffect]}>
      {/* Avatar & Thông tin */}
      <View style={styles.header}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <View style={styles.row}>
            <Text style={styles.name}>{name}</Text>
            <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={onReject}>
              <Text style={styles.buttonText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.date}>Ngày gửi: {requestDate}</Text>
            <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
              <Text style={styles.buttonText}>Duyệt</Text>
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
    backgroundColor: Color.backGround,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Color.borderColor1,
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
    borderColor: Color.mainColor1,
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
    color: Color.textColor1,
  },
  date: {
    fontSize: 14,
    color: Color.textColor3,
  },
  button: {
    width: 80, // ✅ Đảm bảo hai nút có cùng kích thước
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: Color.mainColor2,
  },
  acceptButton: {
    backgroundColor: Color.mainColor1,
  },
  buttonText: {
    color: Color.textColor2,
    fontWeight: "600",
    fontSize: 14,
  },
});

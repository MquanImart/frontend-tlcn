import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import getColor from "@/src/styles/Color";

interface NotificationItemProps {
  avatar: string;
  name: string;
  message: string;
  time: string;
  isUnread: boolean;
  onMarkAsRead: () => void;
  onMarkAsUnRead: () => void;
  onDelete: () => void;
  handleOptions: (onMarkAsRead: () => void, onMarkAsUnread: () => void, onDelete: () => void) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  avatar,
  name,
  message,
  time,
  isUnread,
  onMarkAsRead,
  onMarkAsUnRead,
  onDelete,
  handleOptions,
}) => {
  const colors = getColor();
  return (
    <View style={styles.notificationItemContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.notificationItem}
        onPress={() => handleOptions(onMarkAsRead, onMarkAsUnRead, onDelete)} 
      >
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationMessage, { color: colors.textColor1 }]}>
            <Text style={[styles.boldText, { color: colors.textColor1 }]}>{name}</Text> {message}
          </Text>
          <Text style={styles.notificationTime}>{time}</Text>
        </View>
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.mainColor2 }]} />}
      </TouchableOpacity>
    </View>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  notificationItemContainer: {
    position: "relative",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: getColor().borderColor1,
    backgroundColor: getColor().backGround,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: "bold",
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
    color: getColor().borderColor1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
});

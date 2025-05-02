
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import getColor from "@/src/styles/Color";
const Color = getColor();
// Define the types for the props
interface UserCardProps {
  name: string;
  mutualFriends: number;
  mutualGroups: number;
  imageUrl: string;
  onButtonPress: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  mutualFriends,
  mutualGroups,
  imageUrl,
  onButtonPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.info}>
        {mutualFriends} Friends | {mutualGroups} Groups
      </Text>
      
      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={onButtonPress}>
        <Text style={styles.buttonText}>Xem trang cá nhân</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    backgroundColor: Color.white_homologous,
    marginLeft: 10,
    padding: 10,
    height:270,
    borderRadius: 10,
    elevation: 5, // Android shadow=effect
    shadowColor: Color.white_contrast, // iOS shadow color
    shadowOffset: { width: 1, height: 4 }, // iOS shadow direction=/
    shadowOpacity: 0.1, // iOS shadow opacity
    shadowRadius: 4, // iOS shadow radius
  },
  image: {
    width: 150,
    height: 150,

  },
  name: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "bold",
  },
  info: {
    fontSize: 12,
    color: Color.textColor4,
  },
  button: {
    marginTop: 10,
    backgroundColor: Color.mainColor1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: Color.white_homologous,
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default UserCard;

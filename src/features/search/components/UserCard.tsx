import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  useTheme(); // Ensure this hook is called if it's used to update the theme context
  return (
    <View style={[styles.cardContainer, { backgroundColor: Color.backgroundSecondary }]}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={[styles.name, { color: Color.textPrimary }]}>{name}</Text>
      <Text style={[styles.info, { color: Color.textSecondary }]}>
        {mutualFriends} Friends | {mutualGroups} Groups
      </Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: Color.mainColor2 }]} onPress={onButtonPress}>
        <Text style={[styles.buttonText, { color: Color.textOnMain2 }]}>Xem trang cá nhân</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "center",
    // backgroundColor: Color.white_homologous, // Replaced below with dynamic style
    marginLeft: 10,
    padding: 10,
    height: 270,
    borderRadius: 10,
    elevation: 5, // Android shadow effect
    // shadowColor: Color.white_contrast, // Replaced below with dynamic style
    shadowOffset: { width: 1, height: 4 }, // iOS shadow direction
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
    // color: dynamic style applied inline
  },
  info: {
    fontSize: 12,
    // color: dynamic style applied inline
  },
  button: {
    marginTop: 10,
    // backgroundColor: Color.mainColor2, // Replaced below with dynamic style
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    // color: dynamic style applied inline
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default UserCard;
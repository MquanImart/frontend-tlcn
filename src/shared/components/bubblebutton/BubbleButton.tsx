import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface BubbleButtonProps {
  onPress: () => void;
}

const BubbleButton: React.FC<BubbleButtonProps> = ({ onPress }) => {
  useTheme()

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: Color.mainColor2 }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name="add" size={30} color={Color.textColor2} />
    </TouchableOpacity>
  );
};

export default BubbleButton;

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 150,
    right: 5,
    width: 50,
    height: 50,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, 
  },
});

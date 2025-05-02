import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import getColor from "@/src/styles/Color";

interface CHeaderProps {
  label: string;
  backPress?: () => void;
  showBackButton?: boolean; // Thêm props này để kiểm soát hiển thị nút Back
  labelColor?: string; // Thêm prop này để nhận màu chữ cho label
  iconColor?: string; // Thêm prop này để nhận màu icon
}

const Color = getColor();


const CHeader = ({ label, backPress, labelColor, iconColor, showBackButton = true }: CHeaderProps) => {
  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={backPress} style={styles.buttonBack}>
          <Icon name="arrow-back" size={35} color={iconColor || Color.mainColor1} />
        </TouchableOpacity>
      )}
      <Text style={[styles.textLabel, { color: labelColor || Color.mainColor1 }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 40,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonBack: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  textLabel: {
    fontSize: 25,
    fontWeight: "bold",
  },
});

export default CHeader;

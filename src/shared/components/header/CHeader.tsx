import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface CHeaderProps {
  label: string;
  backPress?: () => void;
  showBackButton?: boolean; // Add this prop to control back button visibility
  labelColor?: string;     // Add this prop for label text color
  iconColor?: string;      // Add this prop for icon color
}

const CHeader = ({ label, backPress, labelColor, iconColor, showBackButton = true }: CHeaderProps) => {
  useTheme(); // Ensure the theme context is used to get updated colors

  return (
    <View style={styles.container}>
      {showBackButton && (
        <TouchableOpacity onPress={backPress} style={styles.buttonBack}>
          {/* Use default iconColor from theme if not provided */}
          <Icon name="arrow-back" size={35} color={iconColor || Color.mainColor2} />
        </TouchableOpacity>
      )}
      {/* Use default labelColor from theme if not provided */}
      <Text style={[styles.textLabel, { color: labelColor || Color.mainColor2 }]}>{label}</Text>
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
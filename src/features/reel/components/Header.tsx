import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface CHeaderProps {
  label: string;
  backPress?: () => void;
  rightPress?: () => void;    // Added for right icon click handler
  showBackButton?: boolean;   // Controls back button visibility
  labelColor?: string;        // Custom label color
  iconColor?: string;         // Custom icon color
  rightIcon?: string;         // Name of the right icon (MaterialIcons)
}

const CHeader = ({ 
  label, 
  backPress, 
  rightPress, 
  labelColor, 
  iconColor, 
  showBackButton = true, 
  rightIcon = "add"  // Default right icon is "add"
}: CHeaderProps) => {
  useTheme()
  return (
    <View style={[styles.container, {backgroundColor: Color.background}]}> {/* Áp dụng màu nền cho container */}
      {showBackButton && (
        <TouchableOpacity onPress={backPress} style={styles.buttonBack}>
          <Icon 
            name="arrow-back" 
            size={35} 
            color={iconColor || Color.textPrimary}  // Thay đổi màu mặc định của icon
          />
        </TouchableOpacity>
      )}
      <Text style={[styles.textLabel, { color: labelColor || Color.textPrimary }]}> {/* Thay đổi màu mặc định của label */}
        {label}
      </Text>
      <TouchableOpacity onPress={rightPress} style={styles.buttonRight}>
        <Icon 
          name={rightIcon} 
          size={35} 
          color={iconColor || Color.textPrimary}  // Thay đổi màu mặc định của icon
        />
      </TouchableOpacity>
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
    // backgroundColor sẽ được định nghĩa inline trong component để sử dụng Color.background
  },
  buttonBack: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  buttonRight: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  textLabel: {
    fontSize: 25,
    fontWeight: "bold",
  },
});

export default CHeader;
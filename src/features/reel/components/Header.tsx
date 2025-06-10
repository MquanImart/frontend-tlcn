import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface CHeaderProps {
  label: string;
  backPress?: () => void;
  rightPress?: () => void;
  showBackButton?: boolean;
  labelColor?: string;
  iconColor?: string;
  rightIcon?: string;
}

const CHeader = ({
  label,
  backPress,
  rightPress,
  labelColor,
  iconColor,
  showBackButton = true,
  rightIcon = "add"
}: CHeaderProps) => {
  useTheme()
  return (
    <View style={[styles.container, {backgroundColor: Color.background}]}>
      {showBackButton && (
        <TouchableOpacity onPress={backPress} style={styles.buttonBack}>
          <Icon
            name="arrow-back"
            size={35}
            color={iconColor || Color.textPrimary}
          />
        </TouchableOpacity>
      )}
      <Text style={[styles.textLabel, { color: labelColor || Color.textPrimary }]}>
        {label}
      </Text>
      <TouchableOpacity onPress={rightPress} style={styles.buttonRight}>
        <Icon
          name={rightIcon}
          size={35}
          color={iconColor || Color.textPrimary}
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
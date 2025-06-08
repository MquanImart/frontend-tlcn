import getColor from "@/src/styles/Color";
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
const Color = getColor();
interface ToggleSwitchProps {
  label: string;
  icon?:any; // Tùy chọn: Thêm icon nếu cần
  onToggle?: (value: boolean) => void; // Callback khi chuyển trạng thái
  initialValue?: boolean; // Trạng thái ban đầu của switch
  extraInfo?: string;
}

const ToggleSwitch = ({ label, icon, onToggle, initialValue = false }: ToggleSwitchProps) => {
  const [isEnabled, setIsEnabled] = useState(initialValue);

  const toggleSwitch = () => {
    setIsEnabled(previousState => !previousState);
    if (onToggle) {
      onToggle(!isEnabled);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        trackColor={{ false: Color.textColor3, true: Color.mainColor1 }}
        thumbColor={isEnabled ? Color.white_homologous : Color.white_homologous}
        onValueChange={toggleSwitch}
        value={isEnabled}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Sắp xếp các phần tử theo chiều ngang
    justifyContent: 'space-between', // Căn giữa giữa các phần tử
    alignItems: 'center',
    width:"100%",
    backgroundColor: Color.white_homologous,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: Color.white_contrast,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Căn giữa icon và label theo chiều dọc
  },
  label: {
    fontSize: 16,
    color: Color.white_contrast,
    marginLeft: 10, // Khoảng cách giữa icon và text
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10, // Khoảng cách giữa icon và text
  },
});

export default ToggleSwitch;

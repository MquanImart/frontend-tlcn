import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface ToggleSwitchProps {
  label: string;
  icon?: any;
  onToggle?: (value: boolean) => void;
  initialValue?: boolean;
}

const ToggleSwitch = ({ label, icon, onToggle, initialValue = false }: ToggleSwitchProps) => {
  // Bỏ đi useTheme(); không cần thiết
  const [isEnabled, setIsEnabled] = useState(initialValue);

  // Thêm useEffect để đồng bộ trạng thái khi prop initialValue thay đổi
  // Điều này rất quan trọng khi initialValue được lấy từ API
  useEffect(() => {
    setIsEnabled(initialValue);
  }, [initialValue]);

  // Sửa lại hàm toggleSwitch để nhận giá trị mới từ Switch
  // và gửi đúng giá trị này cho callback onToggle
  const handleValueChange = (newValue: boolean) => {
    setIsEnabled(newValue);
    if (onToggle) {
      onToggle(newValue);
    }
  };

  return (
    <View style={[styles.container, {
      backgroundColor: Color.backgroundSecondary,
      shadowColor: Color.textSecondary,
    }]}>
      <View style={styles.labelContainer}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text style={[styles.label, { color: Color.textPrimary }]}>{label}</Text>
      </View>
      <Switch
        trackColor={{ false: Color.border, true: Color.mainColor2 }}
        thumbColor={isEnabled ? Color.textOnMain2 : Color.textOnMain2}
        onValueChange={handleValueChange} // Dùng hàm xử lý mới
        value={isEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "100%",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default ToggleSwitch;
// src/screens/ScreenSetting.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import ToggleSwitch from '../../components/ToggleSwitch';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

const ScreenSetting = () => {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    // Sử dụng Color.background cho nền chính, đảm bảo tên màu khớp với DynamicColors.ts
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      {/* Sử dụng Color.backgroundSecondary cho hàng cài đặt, đảm bảo tên màu khớp */}
      <View style={[styles.settingRow, { backgroundColor: Color.backgroundSecondary }]}>
        <ToggleSwitch
          label="Chế độ sáng tối"
          initialValue={isLightMode}
          onToggle={toggleTheme}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor được định nghĩa động trong JSX, không cần ở đây
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 10,
    elevation: 2,
    margin: 10,
    // backgroundColor được định nghĩa động trong JSX, không cần ở đây
  },
});

export default ScreenSetting;
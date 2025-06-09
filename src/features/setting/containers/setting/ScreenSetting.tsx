// src/screens/ScreenSetting.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import ToggleSwitch from '../../components/ToggleSwitch'; // Giả sử bạn đã có component này
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

const ScreenSetting = () => {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <View style={[styles.container, { backgroundColor: Color.backGround }]}>
      <View style={[styles.settingRow, { backgroundColor: Color.white_homologous }]}>
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
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 10,
    elevation: 2,
    margin: 10,
  },
});

export default ScreenSetting;
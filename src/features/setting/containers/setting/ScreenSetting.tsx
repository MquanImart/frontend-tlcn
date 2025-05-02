import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import ToggleSwitch from "../../components/ToggleSwitch";
import getColor from "@/src/styles/Color";
const Color = getColor();
const ScreenSetting = () => {
  const [isLightMode, setIsLightMode] = useState(true);

  const toggleSwitch = (value: boolean) => {
    setIsLightMode(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <ToggleSwitch
          label="Chế độ sáng tối"
          
          initialValue={isLightMode}
          onToggle={toggleSwitch} // Hàm này sẽ được gọi khi toggle thay đổi
        />
      </View>
    </View>
  );
};

export default ScreenSetting;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white_homologous,
    },
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        padding:4,
        backgroundColor:  Color.white_homologous,
        borderRadius: 10,
        elevation: 2,
        marginBottom: 10,
    },
});
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface RuleItemProps {
  index: number;
  text: string;
  onDelete?: () => void; // ✅ onDelete là tùy chọn
}

const RuleItem: React.FC<RuleItemProps> = ({ index, text, onDelete }) => {
  useTheme();
  return (
    <View style={[styles.container, { backgroundColor: Color.backGround }]}>
      <View style={styles.ruleInfo}>
        <View style={[styles.indexContainer, { backgroundColor: Color.backGround1 }]}>
          <Text style={[styles.index, { color: Color.textColor1 }]}>{index}</Text>
        </View>
        <Text style={[styles.text, { color: Color.textColor1 }]} numberOfLines={2} ellipsizeMode="tail">
          {text}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Icon name="remove" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RuleItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
    backgroundColor: Color.backGround,
    borderWidth: 1,
    borderColor: Color.borderColor1,
  },
  ruleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, 
    flexWrap: "wrap", 
  },
  indexContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    backgroundColor: Color.borderColor1,
  },
  index: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 22, 
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 15,
    backgroundColor: "#FF0000", 

    // ✅ Bóng đổ tạo hiệu ứng nổi
    shadowColor: "#FF0000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4, 
  },
});

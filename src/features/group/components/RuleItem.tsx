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
    <View style={[styles.container, { backgroundColor: Color.background, borderColor: Color.border }]}>
      <View style={styles.ruleInfo}>
        <View style={[styles.indexContainer, { backgroundColor: Color.backgroundSecondary }]}>
          <Text style={[styles.index, { color: Color.textPrimary }]}>{index}</Text>
        </View>
        <Text style={[styles.text, { color: Color.textPrimary }]} numberOfLines={2} ellipsizeMode="tail">
          {text}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity style={[styles.deleteButton, { backgroundColor: Color.error, shadowColor: Color.error }]} onPress={onDelete}>
          <Icon name="remove" size={24} color={Color.textOnMain2} />
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
    borderWidth: 1,
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
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
});
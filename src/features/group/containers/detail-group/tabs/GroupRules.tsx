// GroupRules.tsx
import React, { useState } from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from "react-native";
import RuleItem from "@/src/features/group/components/RuleItem";
import AddRuleModal from "@/src/features/group/components/AddRuleModal";
import getColor from "@/src/styles/Color";
import { useGroupRules } from "./useGroupRules"; // Import the custom hook

const Color = getColor();

interface GroupRulesProps {
  groupId: string;
  currentUserId: string;
  role: "Guest" | "Member" | "Admin" | "Owner"; 
}

const GroupRules: React.FC<GroupRulesProps> = ({ groupId, currentUserId, role }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { rules, addRule, deleteRule } = useGroupRules(groupId); 

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách quy định nhóm</Text>

      {role === "Owner" && (
        <TouchableOpacity style={styles.addRuleButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addRuleButtonText}>THÊM QUY ĐỊNH</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={rules}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <RuleItem
            index={index + 1}
            text={item}
            onDelete={role === "Owner" ? () => deleteRule(item) : undefined}
          />
        )}
      />

      <AddRuleModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddRule={addRule} 
      />
    </View>
  );
};

export default GroupRules;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Color.backGround,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.textColor1,
    marginBottom: 15,
  },
  addRuleButton: {
    width: "100%",
    height: 45,
    backgroundColor: Color.mainColor1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  addRuleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

// useGroupRules.ts
import restClient from "@/src/shared/services/RestClient";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const groupsClient = restClient.apiClient.service("apis/groups");

export const useGroupRules = (groupId: string) => {
  const [rules, setRules] = useState<string[]>([]);

  const fetchRules = async () => {
    try {
      const result = await groupsClient.get(`${groupId}/rules`);
      if (result.success) {
        setRules(result.data.rule);
      } else {
        console.error("Lỗi khi lấy quy định:", result.message);
      }
    } catch (error) {
      console.error("Lỗi xảy ra:", error);
    }
  };

  const addRule = async (rule: string) => {
    if (rules.includes(rule)) {
      Alert.alert("Quy tắc đã tồn tại");
      return;
    }

    try {
      const result = await groupsClient.patch(`${groupId}/rules`, { rule });
      if (result.success) {
        setRules((prevRules) => [...prevRules, rule]); 
      } else {
        console.error("Lỗi khi thêm quy tắc:", result.message);
      }
    } catch (error) {
      console.error("Lỗi xảy ra khi thêm quy tắc:", error);
    }
  };

  const deleteRule = (rule: string) => {
    Alert.alert(
      "Xác nhận xóa", 
      `Bạn có chắc chắn muốn xóa quy tắc: "${rule}" không?`,
      [
        {
          text: "Hủy", 
          style: "cancel",
        },
        {
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await groupsClient.patch(`${groupId}/rules/${rule}`, {});
              if (result.success) {
                setRules((prevRules) => prevRules.filter((r) => r !== rule));
              } else {
                console.error("Lỗi khi xóa quy tắc:", result.message);
              }
            } catch (error) {
              console.error("Lỗi xảy ra khi xóa quy tắc:", error);
            }
          },
        },
      ],
      { cancelable: true } 
    );
  };

  useEffect(() => {
    fetchRules(); 
  }, [groupId]);

  return {
    rules,
    addRule,
    deleteRule,
    fetchRules,
  };
};
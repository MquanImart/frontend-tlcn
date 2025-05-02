import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import getColor from "@/src/styles/Color";
import restClient from '@/src/shared/services/RestClient';

const Color = getColor();
const hobbiesClient = restClient.apiClient.service("apis/hobbies");
const UsersClient = restClient.apiClient.service("apis/users");

interface Preference {
  id: string;
  name: string;
}

interface ChangePreferencesDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedPreferences: Preference[]) => void;
  userId: string | null;
  initialPreferences: Preference[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChangePreferencesDialog = ({ visible, onClose, onSave, userId, initialPreferences }: ChangePreferencesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialPreferences.map(pref => pref.id));
  const [currentPreferences, setCurrentPreferences] = useState<Preference[]>(initialPreferences);
  const [availablePreferences, setAvailablePreferences] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedPreferences(initialPreferences.map(pref => pref.id));
      setCurrentPreferences(initialPreferences);
      fetchAvailablePreferences();
      setError(null);
    }
  }, [visible, initialPreferences]);

  const fetchAvailablePreferences = async () => {
    try {
      setLoading(true);
      const response = await hobbiesClient.find({});
      console.log("Dữ liệu sở thích:", response.data); // Kiểm tra dữ liệu API
      if (response.success) {
        const hobbies = response.data.map((hobby: { name: string; _id: string }) => ({
          label: hobby.name,
          value: hobby._id,
        }));
        setAvailablePreferences(hobbies);
        if (hobbies.length === 0) {
          setError("Không có sở thích nào để hiển thị");
        }
      } else {
        setError("Không thể tải danh sách sở thích");
      }
    } catch (err) {
      setError("Lỗi khi tải sở thích");
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  // Đồng bộ selectedPreferences với currentPreferences
  useEffect(() => {
    const newPreferences = selectedPreferences
      .map(id => {
        const existingPref = currentPreferences.find(pref => pref.id === id);
        if (existingPref) return existingPref;
        const newPref = availablePreferences.find(pref => pref.value === id);
        return newPref ? { id: newPref.value, name: newPref.label } : null;
      })
      .filter((pref): pref is Preference => pref !== null);
    setCurrentPreferences(newPreferences);
  }, [selectedPreferences, availablePreferences]);

  const handleRemovePreference = (id: string) => {
    setSelectedPreferences(selectedPreferences.filter(prefId => prefId !== id));
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const hobbyNames = currentPreferences.map(pref => pref.name);
      const response = await UsersClient.patch(`${userId}/hobbies`, { hobbies: hobbyNames });
      if (!response.success) {
        throw new Error(response.message || "Lỗi khi cập nhật sở thích");
      }

      const updatedPreferences = response.data.map((hobby: any) => ({
        id: hobby._id,
        name: hobby.name,
      }));
      onSave(updatedPreferences);
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định khi lưu sở thích");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return [
        {
          key: 'loading',
          content: <Text style={styles.loadingText}>Đang tải...</Text>,
        },
      ];
    }

    return [
      {
        key: 'dropdown',
        content: (
          <View style={styles.dropdownContainer}>
            <Text style={styles.label}>Chọn sở thích</Text>
            <DropDownPicker
              open={open}
              setOpen={setOpen}
              value={selectedPreferences}
              setValue={setSelectedPreferences}
              items={availablePreferences}
              multiple={true}
              min={0}
              showTickIcon
              mode="BADGE"
              placeholder="Chọn sở thích"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContent}
              labelStyle={styles.dropdownLabel}
              listMode="SCROLLVIEW"
              zIndex={3000}
              zIndexInverse={1000}
              dropDownDirection="BOTTOM"
              maxHeight={200} // Giới hạn hiển thị ~4 sở thích
              scrollViewProps={{
                showsVerticalScrollIndicator: true,
                scrollEnabled: true,
                bounces: true,
              }}
              searchable={false}
            />
          </View>
        ),
      },
      {
        key: 'currentPreferencesLabel',
        content: <Text style={styles.label}>Sở thích hiện tại</Text>,
      },
      {
        key: 'currentPreferences',
        content:
          currentPreferences.length > 0 ? (
            currentPreferences.map((pref) => ({
              id: pref.id,
              content: (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceText}>• {pref.name}</Text>
                  <TouchableOpacity onPress={() => handleRemovePreference(pref.id)}>
                    <Ionicons name="close-circle" size={18} color={Color.mainColor1} />
                  </TouchableOpacity>
                </View>
              ),
            }))
          ) : (
            <Text style={styles.noPreferencesText}>Chưa có sở thích nào được chọn</Text>
          ),
      },
      {
        key: 'error',
        content: error ? <Text style={styles.errorText}>{error}</Text> : null,
      },
    ];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chỉnh sửa sở thích</Text>

          <FlatList
            data={renderContent().flatMap(item =>
              Array.isArray(item.content) ? item.content.map((subItem, index) => ({
                ...subItem,
                key: `${item.key}_${index}`,
              })) : [{ key: item.key, content: item.content }],
            )}
            renderItem={({ item }) => item.content}
            keyExtractor={item => item.key}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            style={styles.flatList}
            contentContainerStyle={styles.flatListContent}
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Color.textColor3 }]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Color.mainColor1 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: Color.white_homologous,
    borderRadius: 10,
    padding: 20,
    height: SCREEN_HEIGHT * 0.55, // Chiều cao cố định
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Color.white_contrast,
    marginBottom: 15,
    textAlign: 'center',
  },
  flatList: {
    flex: 1, // Chiếm toàn bộ không gian khả dụng
    maxHeight: SCREEN_HEIGHT * 0.85 - 100, // Trừ tiêu đề (~40px) và nút (~60px)
  },
  flatListContent: {
    paddingBottom: 80, // Đảm bảo nút không che nội dung
  },
  dropdownContainer: {
    zIndex: 3000, // Đảm bảo DropDownPicker hiển thị trên cùng
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Color.textColor1,
    marginBottom: 10,
    marginTop: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Color.textColor3,
    borderRadius: 8,
    backgroundColor: Color.white_homologous,
  },
  dropdownContent: {
    borderWidth: 1,
    borderColor: Color.textColor3,
    backgroundColor: Color.white_homologous,
    maxHeight: 200,
  },
  dropdownLabel: {
    fontSize: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: Color.backGround2,
    marginBottom: 5,
  },
  preferenceText: {
    fontSize: 16,
    color: Color.textColor1,
  },
  noPreferencesText: {
    fontSize: 16,
    color: Color.textColor3,
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 16,
    color: Color.white_contrast,
    textAlign: 'center',
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Color.textColor3,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Color.white_homologous, // Đảm bảo nút không bị trong suốt
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: Color.white_homologous,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePreferencesDialog;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text, // Đảm bảo Text được import
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
  ActivityIndicator, // Đảm bảo ActivityIndicator được import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo đường dẫn này đúng
import { useTheme } from '@/src/contexts/ThemeContext'; // Ensure this path is correct
import restClient from '@/src/shared/services/RestClient';

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
  useTheme(); // Kích hoạt theme context để truy cập màu động
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
      setError(null); // Reset error khi mở dialog
    }
  }, [visible, initialPreferences]);

  const fetchAvailablePreferences = async () => {
    try {
      setLoading(true);
      const response = await hobbiesClient.find({});
      if (response.success) {
        const hobbies = response.data.map((hobby: { name: string; _id: string }) => ({
          label: hobby.name,
          value: hobby._id,
        }));
        setAvailablePreferences(hobbies);
        if (hobbies.length === 0) {
          setError("Không có sở thích nào để hiển thị."); // Đảm bảo chuỗi này là một chuỗi
        }
      } else {
        setError(response.message || "Không thể tải danh sách sở thích."); // Đảm bảo chuỗi này là một chuỗi
      }
    } catch (err) {
      setError("Lỗi khi tải sở thích."); // Đảm bảo chuỗi này là một chuỗi
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Đồng bộ selectedPreferences với currentPreferences
    // Đảm bảo availablePreferences đã tải xong (hoặc không còn loading) trước khi đồng bộ
    if (availablePreferences.length > 0 || !loading) {
      const newPreferences = selectedPreferences
        .map(id => {
          const newPref = availablePreferences.find(pref => pref.value === id);
          return newPref ? { id: newPref.value, name: newPref.label } : null;
        })
        .filter((pref): pref is Preference => pref !== null);
      setCurrentPreferences(newPreferences);
    }
  }, [selectedPreferences, availablePreferences, loading]);

  const handleRemovePreference = (id: string) => {
    setSelectedPreferences(selectedPreferences.filter(prefId => prefId !== id));
  };

  const handleSave = async () => {
    if (!userId) {
      setError("Không có ID người dùng để lưu sở thích."); // Đảm bảo chuỗi này là một chuỗi
      return;
    }
    try {
      setLoading(true);
      const hobbyNames = currentPreferences.map(pref => pref.name);
      const response = await UsersClient.patch(`${userId}/hobbies`, { hobbies: hobbyNames });
      if (!response.success) {
        throw new Error(response.message || "Lỗi khi cập nhật sở thích."); // Đảm bảo chuỗi này là một chuỗi
      }

      const updatedPreferences = response.data.map((hobby: any) => ({
        id: hobby._id,
        name: hobby.name,
      }));
      onSave(updatedPreferences);
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định khi lưu sở thích."); // Đảm bảo chuỗi này là một chuỗi
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo dữ liệu cho FlatList
  const renderContent = () => {
    if (loading) {
      return [
        {
          key: 'loading',
          content: (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Color.mainColor2} />
              <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải...</Text>
            </View>
          ),
        },
      ];
    }

    return [
      {
        key: 'dropdown',
        content: (
          <View style={styles.dropdownContainer}>
            <Text style={[styles.label, { color: Color.textPrimary }]}>Chọn sở thích</Text>
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
              style={[styles.dropdown, { borderColor: Color.border, backgroundColor: Color.backgroundTertiary }]}
              dropDownContainerStyle={[styles.dropdownContent, { borderColor: Color.border, backgroundColor: Color.backgroundTertiary }]}
              labelStyle={[styles.dropdownLabel, { color: Color.textPrimary }]}
              selectedItemLabelStyle={{ color: Color.mainColor2 }}
              textStyle={{ color: Color.textPrimary }}
              listMode="SCROLLVIEW"
              zIndex={3000}
              zIndexInverse={1000}
              dropDownDirection="BOTTOM"
              maxHeight={200}
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
        content: <Text style={[styles.label, { color: Color.textPrimary }]}>Sở thích hiện tại</Text>,
      },
      {
        key: 'currentPreferences',
        content:
          currentPreferences.length > 0 ? (
            currentPreferences.map((pref) => ({
              id: pref.id,
              content: (
                <View style={[styles.preferenceItem, { backgroundColor: Color.backgroundSelected, borderColor: Color.border }]}>
                  <Text style={[styles.preferenceText, { color: Color.textPrimary }]}>• {pref.name}</Text>
                  <TouchableOpacity onPress={() => handleRemovePreference(pref.id)}>
                    <Ionicons name="close-circle" size={18} color={Color.error} />
                  </TouchableOpacity>
                </View>
              ),
            }))
          ) : (
            <Text style={[styles.noPreferencesText, { color: Color.textSecondary }]}>Chưa có sở thích nào được chọn</Text>
          ),
      },
      {
        key: 'error',
        content: error ? <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text> : null,
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
        <View style={[styles.modalContainer, { backgroundColor: Color.backgroundSecondary }]}>
          <Text style={[styles.modalTitle, { color: Color.textPrimary }]}>Chỉnh sửa sở thích</Text>

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
            keyboardShouldPersistTaps="handled" // Giúp DropDownPicker không bị đóng khi chạm ra ngoài
          />

          <View style={[styles.modalButtonContainer, { backgroundColor: Color.backgroundSecondary, borderTopColor: Color.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Color.textTertiary }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: Color.textOnMain2 }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: Color.mainColor2 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={[styles.modalButtonText, { color: Color.textOnMain2 }]}>
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
    borderRadius: 10,
    padding: 20,
    height: SCREEN_HEIGHT * 0.55,
    maxHeight: SCREEN_HEIGHT * 0.85,
    // Màu bóng giữ nguyên giá trị cứng vì không có biến shadowColor trong danh sách bạn cung cấp
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  flatList: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.85 - 100,
  },
  flatListContent: {
    paddingBottom: 80,
  },
  dropdownContainer: {
    zIndex: 3000,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownContent: {
    borderWidth: 1,
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
    marginBottom: 5,
    // Add border to items for better visual separation
    borderWidth: 1, 
  },
  preferenceText: {
    fontSize: 16,
  },
  noPreferencesText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Đảm bảo có đủ padding
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  errorText: {
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
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePreferencesDialog;
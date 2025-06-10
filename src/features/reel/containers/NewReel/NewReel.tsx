import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import CButton from '@/src/shared/components/button/CButton';
import CHeader from '@/src/shared/components/header/CHeader';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đảm bảo import đối tượng Color
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import restClient from '@/src/shared/services/RestClient';
const reelsClient = restClient.apiClient.service("apis/reels");

interface NewReelProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  isLoading: boolean;
  onReelCreated?: () => void;
  userId: string; // Thêm userId vào props
}

const NewReel: React.FC<NewReelProps> = ({ isModalVisible, toggleModal, isLoading, onReelCreated, userId }) => {
  useTheme()
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [scope, setScope] = useState<'Công khai' | 'Riêng tư'>('Công khai');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Hàm chọn video
  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Chúng tôi cần quyền truy cập thư viện media để chọn video. Vui lòng cấp quyền trong cài đặt thiết bị.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi khi chọn video:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn video. Vui lòng thử lại.');
    }
  };

  // Xóa video
  const removeVideo = () => {
    setVideoUri(null);
  };

  // Thêm hashtag (tự động thêm # nếu chưa có)
  const handleAddHashtag = () => {
    if (hashtagInput.trim()) {
      let formattedHashtag = hashtagInput.trim();
      // Nếu hashtag chưa bắt đầu bằng #, thêm vào
      if (!formattedHashtag.startsWith('#')) {
        formattedHashtag = `#${formattedHashtag}`;
      }
      // Kiểm tra trùng lặp
      if (!hashtags.includes(formattedHashtag)) {
        setHashtags([...hashtags, formattedHashtag]);
      }
      setHashtagInput('');
    }
  };

  // Xóa hashtag
  const handleRemoveHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  // Xử lý đăng bài với restClient
  const handlePost = async () => {
    if (!videoUri) {
      Alert.alert('Lỗi', 'Vui lòng chọn video trước khi đăng!');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      // Thêm các trường dữ liệu
      formData.append('createdBy', userId); // Sử dụng userId từ props
      formData.append('content', content);
      formData.append('scope', scope);
      hashtags.forEach((tag, index) => {
        formData.append(`hashTag[${index}]`, tag);
      });

      // Thêm file video
      const fileName = videoUri.split('/').pop() || 'reel_video.mp4';
      formData.append('media', {
        uri: videoUri,
        name: fileName,
        type: 'video/mp4',
      } as any);

      // Gửi yêu cầu POST với restClient
      const response = await reelsClient.create(formData);

      if (response.success) {
        toggleModal();
        if (onReelCreated) onReelCreated();
      } else {
        throw new Error('Đăng reel thất bại!');
      }
    } catch (error) {
      console.error('❌ Lỗi khi đăng reel:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng reel. Vui lòng thử lại!');
    } finally {
      setUploading(false);
    }
  };

  // Chuyển đổi trạng thái modal phạm vi
  const togglePrivacyModal = () => {
    setPrivacyModalVisible(!isPrivacyModalVisible);
  };

  // Lấy biểu tượng cho phạm vi
  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'Công khai':
        return <Ionicons name="earth" size={18} color={Color.textTertiary} />;
      case 'Riêng tư':
        return <Ionicons name="lock-closed" size={18} color={Color.textTertiary} />;
      default:
        return <Ionicons name="earth" size={18} color={Color.textTertiary} />;
    }
  };

  return (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.overlay, { backgroundColor: Color.shadow }]}
        >
          <View style={[styles.dialog, { backgroundColor: Color.backgroundSecondary, shadowColor: Color.shadow }]}>
            <View style={{ marginTop: -60 }}>
              <CHeader
                label="Tạo Thước Phim"
                backPress={toggleModal}
                showBackButton={true}
                labelColor={Color.textPrimary}
                // iconColor cần được xem xét lại nếu Color.iconColor không có trong interface
                // Hiện tại, Color.mainColor2 hoặc Color.textPrimary có thể phù hợp hơn
                iconColor={Color.textPrimary} 
              />
            </View>

            <TouchableOpacity
              style={[styles.scopeSelector, { borderColor: Color.border }]}
              onPress={togglePrivacyModal}
              disabled={isLoading || uploading}
            >
              {getScopeIcon(scope)}
              <Text style={[styles.scopeText, { color: Color.textPrimary }]}>{scope}</Text>
              <Ionicons name="chevron-down" size={18} color={Color.textTertiary} />
            </TouchableOpacity>

            <Modal visible={isPrivacyModalVisible} transparent animationType="fade">
              <View style={[styles.scopeOverlay, { backgroundColor: Color.shadow }]}>
                <View style={[styles.scopeModal, { backgroundColor: Color.backgroundSecondary }]}>
                  <Text style={[styles.scopeTitle, { color: Color.textPrimary }]}>
                    Chọn phạm vi hiển thị
                  </Text>
                  {['Công khai', 'Riêng tư'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.scopeOption}
                      onPress={() => {
                        setScope(option as 'Công khai' | 'Riêng tư');
                        togglePrivacyModal();
                      }}
                    >
                      {getScopeIcon(option)}
                      <Text style={[styles.scopeOptionText, { color: Color.textPrimary }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>

            {videoUri ? (
              <View style={styles.videoWrapper}>
                <Video
                  source={{ uri: videoUri }}
                  style={styles.video}
                  resizeMode={ResizeMode.COVER}
                  isMuted={true}
                  shouldPlay={false}
                />
                <TouchableOpacity
                  style={[styles.removeVideo, { backgroundColor: Color.shadow }]}
                  onPress={removeVideo}
                  disabled={isLoading || uploading}
                >
                  <Ionicons name="close" size={18} color={Color.white_white} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.uploadButton, { borderColor: Color.border, backgroundColor: Color.backgroundTertiary }]} onPress={pickVideo} disabled={isLoading || uploading}>
                <Feather name="video" size={40} color={Color.mainColor2} />
                <Text style={[styles.uploadText, { color: Color.textPrimary }]}>
                  Chọn video từ thiết bị
                </Text>
              </TouchableOpacity>
            )}

            <TextInput
              style={[styles.textInput, { color: Color.textPrimary, borderColor: Color.border, backgroundColor: Color.background }]}
              placeholder="Mô tả thước phim của bạn..."
              placeholderTextColor={Color.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
              editable={!isLoading && !uploading}
              blurOnSubmit={true}
            />

            <View style={[styles.hashtagContainer, { borderColor: Color.border, backgroundColor: Color.background }]}>
              <TextInput
                style={[styles.hashtagInput, { color: Color.textPrimary }]}
                placeholder="#hashtag"
                placeholderTextColor={Color.textTertiary}
                value={hashtagInput}
                onChangeText={setHashtagInput}
                onSubmitEditing={handleAddHashtag}
                editable={!isLoading && !uploading}
                blurOnSubmit={true}
              />
              <TouchableOpacity onPress={handleAddHashtag} disabled={isLoading || uploading}>
                <Ionicons name="add-circle" size={26} color={Color.mainColor2} />
              </TouchableOpacity>
            </View>

            {hashtags.length > 0 && (
              <View style={styles.hashtagList}>
                {hashtags.map((tag, index) => (
                  <View key={index} style={[styles.hashtagItem, { backgroundColor: Color.backgroundTertiary }]}>
                    <Text style={[styles.hashtagText, { color: Color.textPrimary }]}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveHashtag(index)}
                      disabled={isLoading || uploading}
                    >
                      <Ionicons name="close-circle" size={18} color={Color.textTertiary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <CButton
              label={uploading ? 'Đang đăng...' : 'Đăng Thước Phim'}
              onSubmit={handlePost}
              disabled={isLoading || uploading}
              style={{
                width: '100%',
                height: 50,
                backColor: uploading ? Color.backgroundTertiary : Color.mainColor2, // Changed from buttonDisabled
                textColor: Color.white_white,
                radius: 10,
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              {uploading && (
                <ActivityIndicator
                  size="small"
                  color={Color.white_white}
                  style={styles.loadingIndicator}
                />
              )}
            </CButton>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default NewReel;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Color.shadow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '90%',
    borderRadius: 15,
    padding: 20,
    backgroundColor: Color.backgroundSecondary,
    shadowColor: Color.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scopeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.border,
    marginBottom: 15,
  },
  scopeText: {
    fontSize: 14,
    marginLeft: 8,
    color: Color.textPrimary
  },
  scopeOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.shadow,
  },
  scopeModal: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    backgroundColor: Color.backgroundSecondary,
  },
  scopeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Color.textPrimary,
  },
  scopeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  scopeOptionText: {
    fontSize: 14,
    marginLeft: 10,
    color: Color.textPrimary
  },
  videoWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeVideo: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Color.shadow,
    borderRadius: 15,
    padding: 6,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Color.border,
    backgroundColor: Color.backgroundTertiary, // Sử dụng màu nền nhạt hơn cho nút upload
    marginBottom: 15,
  },
  uploadText: {
    fontSize: 16,
    marginTop: 10,
    color: Color.textPrimary,
  },
  textInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: Color.textPrimary,
    borderColor: Color.border,
    backgroundColor: Color.background,
  },
  hashtagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderColor: Color.border,
    backgroundColor: Color.background,
  },
  hashtagInput: {
    flex: 1,
    fontSize: 16,
    color: Color.textPrimary,
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.backgroundTertiary, // Sử dụng backgroundTertiary cho hashtag item
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 5,
  },
  hashtagText: {
    color: Color.textPrimary,
    fontSize: 14,
    marginRight: 5,
  },
  loadingIndicator: {
    marginLeft: 10,
  },
});
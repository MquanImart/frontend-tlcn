import { Reels } from '@/src/features/reel/interface/reels';
import { ReelStackParamList } from '@/src/shared/routes/ReelNavigation';
import { TabbarStackParamList } from '@/src/shared/routes/TabbarBottom';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors'; // Đã import đối tượng Color
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Video } from 'expo-av';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import CommentItem from '../../components/CommentItem';
import CHeader from '../../components/Header';
import { SingleReel } from './SingleReel';
import useReels from './useReels';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SettingNavigationProp = StackNavigationProp<TabbarStackParamList, 'Menu'>;
type ReelDetailRouteProp = RouteProp<ReelStackParamList, 'ReelDetail'>;

export default function ReelDetail() {
  useTheme()
  const [reel, setReel] = useState<Reels | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const videoRef = useRef<Video | null>(null);
  const navigation = useNavigation<SettingNavigationProp>();
  const route = useRoute<ReelDetailRouteProp>();
  const { reelId, currentId } = route.params;

  const {
    getReelById,
    currentReel,
    isModalVisible,
    newReply,
    openComments,
    closeComments,
    likeComment,
    likeReel,
    replyToComment,
    calculateTotalComments,
    handleAddComment,
    setNewReply,
    pickMedia,
    selectedMedia,
  } = useReels([reel].filter(Boolean) as Reels[], (reels) => setReel(reels[0] || null), setLoading);

  const getUserID = async () => {
    try {
      const storedUserID = await AsyncStorage.getItem('userId');
      if (storedUserID) {
        const cleanUserID = storedUserID.replace(/"/g, '');
        setUserID(cleanUserID);
      } else {
        console.log('Không tìm thấy userID trong AsyncStorage, chuyển hướng đến Login');
      }
    } catch (error) {
      console.error('Lỗi khi lấy userID từ AsyncStorage:', error);
    }
  };

  const fetchReel = async () => {
    setLoading(true);
    try {
      const result = await getReelById(reelId);
      if (result?.success && result.data) {
        setReel(result.data);
      } else {
        console.warn('Không tìm thấy reel hoặc lỗi từ API');
        setReel(null);
      }
    } catch (error) {
      console.error('Lỗi khi tải reel:', error);
      setReel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserID();
    fetchReel();
  }, [reelId]);

  useEffect(() => {
    if (reel && videoRef.current && !isModalVisible) {
      videoRef.current.playAsync();
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, [reel, isModalVisible]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}> {/* Áp dụng màu nền */}
        <ActivityIndicator size="large" color={Color.mainColor2} />
      </View>
    );
  }

  if (!reel) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}> {/* Áp dụng màu nền */}
        <Text style={[styles.emptyText, { color: Color.textPrimary }]}>Không tìm thấy reel</Text> {/* Áp dụng màu chữ */}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Color.black_black }}> {/* Thay đổi màu nền */}
      <SingleReel
        reel={reel}
        onCommentPress={() => openComments(reel)}
        onLike={() => likeReel(reel._id, reel.createdBy._id)}
        setVideoRef={(ref: Video | null) => (videoRef.current = ref)}
        userId={userID || ''}
      />

      <View style={[styles.headerContainer, {backgroundColor: Color.backGround}]}> 
        <CHeader
          label="Reel"
          backPress={() => navigation.goBack()}
          labelColor={Color.white_white} 
          iconColor={Color.white_white} 
        />
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        swipeDirection="down"
        onSwipeComplete={closeComments}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.commentContainer, { backgroundColor: Color.backgroundSecondary }]}> {/* Áp dụng màu nền */}
              <View style={[styles.commentHeader, { borderBottomColor: Color.border }]}> {/* Áp dụng màu viền */}
                <Text style={[styles.commentTitle, { color: Color.textPrimary }]}> {/* Áp dụng màu chữ */}
                  {calculateTotalComments(currentReel?.comments || [])} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color={Color.textPrimary} /> {/* Áp dụng màu icon */}
                </TouchableOpacity>
              </View>

              <FlatList
                data={currentReel?.comments || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <CommentItem
                    userId={userID || ''}
                    comment={item}
                    onLike={likeComment}
                    onReply={replyToComment}
                  />
                )}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.commentList}
                keyboardShouldPersistTaps="handled"
              />

              {selectedMedia.length > 0 && (
                <View style={styles.mediaPreviewContainer}>
                  {selectedMedia.map((media, index) => (
                    <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                  ))}
                </View>
              )}

              <View style={[styles.commentInputContainer, {backgroundColor: Color.backgroundSecondary, borderColor: Color.border, borderTopColor: Color.border}]}> {/* Áp dụng màu nền và viền */}
                <TouchableOpacity onPress={pickMedia}>
                  <Ionicons name="image" size={24} color={Color.mainColor2} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.commentInput, { color: Color.textPrimary }]} 
                  placeholder="Viết bình luận..."
                  placeholderTextColor={Color.textTertiary} 
                  value={newReply}
                  onChangeText={setNewReply}
                />
                <TouchableOpacity onPress={handleAddComment} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={Color.mainColor2} />
                  ) : (
                    <Ionicons name="send" size={20} color={Color.mainColor2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background, // Thay đổi màu nền
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background, // Thay đổi màu nền
  },
  emptyText: {
    color: Color.textPrimary, // Thay đổi màu chữ
    fontSize: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Color.backGround,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  commentContainer: {
    height: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    backgroundColor: Color.backgroundSecondary, // Thay đổi màu nền
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: Color.border, // Thay đổi màu viền
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.textPrimary, // Thay đổi màu chữ
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: Color.border, // Thay đổi màu viền
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.backgroundSecondary, // Thay đổi màu nền
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Color.border, // Thay đổi màu viền
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: Color.textPrimary, // Thay đổi màu chữ
    paddingHorizontal: 10,
  },
  commentList: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  mediaPreview: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
});
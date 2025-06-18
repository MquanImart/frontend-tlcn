import { Reels } from '@/src/features/reel/interface/reels';
import { ReelStackParamList } from '@/src/shared/routes/ReelNavigation';
import { TabbarStackParamList } from '@/src/shared/routes/TabbarBottom';
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
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
  const [totalComments, setTotalComments] = useState<number>(0); // State để lưu tổng số comment

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
    isCommentChecking
  } = useReels(
    [reel].filter(Boolean) as Reels[],
    (reels) => {
      if (Array.isArray(reels)) {
        setReel(reels[0] || null);
      }
    },
    setLoading
  );

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
  // Lấy tổng số comment khi mở modal bình luận
  useEffect(() => {
    if (isModalVisible && currentReel?._id) {
      const fetchTotalComments = async () => {
        const total = await calculateTotalComments(currentReel._id);
        setTotalComments(total);
      };
      fetchTotalComments();
    }
  }, [isModalVisible, currentReel?._id, calculateTotalComments]);
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
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
      </View>
    );
  }

  if (!reel) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: Color.background }]}>
        <Text style={[styles.emptyText, { color: Color.textPrimary }]}>Không tìm thấy reel</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Color.black_black }}>
      <SingleReel
        reel={reel}
        onCommentPress={() => openComments(reel)}
        onLike={() => likeReel(reel._id, reel.createdBy._id)}
        setVideoRef={(ref: Video | null) => (videoRef.current = ref)}
        userId={userID || ''}
      />

      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={35} color={Color.white_white} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeComments}
        style={styles.modal}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={[styles.commentContainer, { backgroundColor: Color.background }]}>
            <View style={styles.commentHeader}>
              <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
                {totalComments} bình luận
              </Text>
              <TouchableOpacity onPress={closeComments}>
                <Ionicons name="close" size={24} color={Color.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={currentReel?.comments || []}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <CommentItem
                  userId={userID || ""}
                  comment={item}
                  onLike={likeComment}
                  onReply={replyToComment}
                />
              )}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.commentList}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({ length: 100, offset: 100 * index, index })}
              nestedScrollEnabled={true}
              onScrollBeginDrag={() => Keyboard.dismiss()}
            />

            {selectedMedia.length > 0 && (
              <View style={styles.mediaPreviewContainer}>
                {selectedMedia.map((media, index) => (
                  <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                ))}
              </View>
            )}

            <View
              style={[styles.commentInputContainer, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]}
            >
              <TouchableOpacity onPress={pickMedia} activeOpacity={0.7}>
                <Ionicons name="image" size={24} color={Color.mainColor2} />
              </TouchableOpacity>
              <TextInput
                style={[styles.commentInput, { color: Color.textPrimary }]}
                placeholder="Viết bình luận..."
                placeholderTextColor={Color.textTertiary}
                value={newReply}
                onChangeText={setNewReply}
                multiline
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {isCommentChecking ? (
                <ActivityIndicator size="small" color={Color.mainColor2} />
              ) : (
                <TouchableOpacity onPress={handleAddComment} activeOpacity={0.7}>
                  <Ionicons name="send" size={20} color={Color.mainColor2} />
                </TouchableOpacity>
              )}
            </View>
          </View>
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
    backgroundColor: Color.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
  },
  emptyText: {
    color: Color.textPrimary,
    fontSize: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // Removed backgroundColor here as CHeader now handles its own background.
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
    backgroundColor: Color.backgroundSecondary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: Color.border,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Color.textPrimary,
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: Color.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Color.border,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: Color.textPrimary,
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
    headerLabel: {
    color: Color.white_white,
    fontSize: 25,
    fontWeight: 'bold',
    textShadowColor: Color.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerIcon: {
    shadowColor: Color.black_black,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.75,
    shadowRadius: 2,
  },
    headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
});
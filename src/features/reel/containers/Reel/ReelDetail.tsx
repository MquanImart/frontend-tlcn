import { Reels } from '@/src/features/reel/interface/reels';
import { ReelStackParamList } from '@/src/shared/routes/ReelNavigation';
import { TabbarStackParamList } from '@/src/shared/routes/TabbarBottom';
import getColor from '@/src/styles/Color';
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

const colors = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SettingNavigationProp = StackNavigationProp<TabbarStackParamList, 'Menu'>;
type ReelDetailRouteProp = RouteProp<ReelStackParamList, 'ReelDetail'>;

export default function ReelDetail() {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mainColor1} />
      </View>
    );
  }

  if (!reel) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy reel</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <SingleReel
        reel={reel}
        onCommentPress={() => openComments(reel)}
        onLike={() => likeReel(reel._id, reel.createdBy._id)}
        setVideoRef={(ref: Video | null) => (videoRef.current = ref)}
        userId={userID || ''}
      />

      <View style={styles.headerContainer}>
        <CHeader
          label="Reel"
          backPress={() => navigation.goBack()}
          labelColor={colors.backGround1}
          iconColor={colors.backGround1}
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
            <View style={[styles.commentContainer, { backgroundColor: colors.backGround }]}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentTitle, { color: colors.textColor1 }]}>
                  {calculateTotalComments(currentReel?.comments || [])} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color={colors.textColor1} />
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

              <View style={styles.commentInputContainer}>
                <TouchableOpacity onPress={pickMedia}>
                  <Ionicons name="image" size={24} color={colors.mainColor1} />
                </TouchableOpacity>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận..."
                  placeholderTextColor={colors.textColor3}
                  value={newReply}
                  onChangeText={setNewReply}
                />
                <TouchableOpacity onPress={handleAddComment} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.mainColor1} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.mainColor1} />
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
    backgroundColor: 'black',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
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
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: colors.borderColor1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentInputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderColor1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backGround,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderColor1,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textColor1,
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
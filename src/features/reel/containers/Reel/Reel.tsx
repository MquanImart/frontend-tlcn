import { Reels } from '@/src/features/reel/interface/reels';
import { ReelStackParamList } from '@/src/shared/routes/ReelNavigation';
import { TabbarStackParamList } from '@/src/shared/routes/TabbarBottom';
import getColor from '@/src/styles/Color';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
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
import NewReel from '../NewReel/NewReel';
import { SingleReel } from './SingleReel';
import useReels from './useReels';
import { StackNavigationProp } from '@react-navigation/stack';

const colors = getColor();
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SettingNavigationProp = StackNavigationProp<TabbarStackParamList, 'Menu'>;
type ReelNavigationProp = StackNavigationProp<ReelStackParamList, 'Reel'>;
type ReelListRouteProp = RouteProp<ReelStackParamList, 'Reel'>;

export default function ReelsList() {
  const [reels, setReels] = useState<Reels[]>([]);
  const navigation = useNavigation<SettingNavigationProp>();
  const navigationReel = useNavigation<ReelNavigationProp>();
  const route = useRoute<ReelListRouteProp>();
  const videoRefs = useRef<(Video | null)[]>([]);
  const currentVideoIndex = useRef<number>(0);
  const wasPlayingBeforeModal = useRef<boolean>(false);
  const [userID, setUserID] = useState<string | null>(null);
  const [isNewReelModalVisible, setNewReelModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCommentLoading, setCommentLoading] = useState(false);
  const [isLoadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef<FlatList<Reels>>(null);
  const initialReelId = route.params?.reelId;

  const getUserID = async () => {
    try {
      const storedUserID = await AsyncStorage.getItem("userId");
      if (storedUserID) {
        const cleanUserID = storedUserID.replace(/"/g, "");
        setUserID(cleanUserID);
      } else {
        console.log("Không tìm thấy userID trong AsyncStorage, chuyển hướng đến Login");
      }
    } catch (error) {
      console.error("Lỗi khi lấy userID từ AsyncStorage:", error);
    }
  };

  useEffect(() => {
    getUserID();
  }, []);

  const {
    getReels,
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
  } = useReels(reels, setReels, setCommentLoading);

  const fetchReels = async (pageNum: number = 0) => {
    if (!hasMore && pageNum !== 0) return;
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getReels(pageNum);
      if (result?.success && result.data.length > 0) {
        const newReels = result.data;
        setReels(pageNum === 0 ? newReels : [...reels, ...newReels]);
        setHasMore(newReels.length === 4 && reels.length + newReels.length < result.total);
        setPage(pageNum);
      } else {
        console.warn('Không có dữ liệu reels hoặc lỗi từ API');
        if (pageNum === 0) setReels([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Lỗi khi tải reels:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    if (initialReelId && reels.length > 0) {
      const index = reels.findIndex(reel => reel._id === initialReelId);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: index, animated: true, viewPosition: 0 });
          if (videoRefs.current[index] && !isModalVisible) {
            videoRefs.current[index]?.playAsync();
            currentVideoIndex.current = index;
          }
        }, 500);
      }
    }
  }, [initialReelId, reels, isModalVisible]);

  const loadMoreReels = () => {
    if (!hasMore || isLoadingMore) return;
    fetchReels(page + 1);
  };

  useEffect(() => {
    const currentVideo = videoRefs.current[currentVideoIndex.current];
    if (isModalVisible && currentVideo) {
      currentVideo.getStatusAsync().then((status) => {
        if (status.isLoaded && status.isPlaying) {
          wasPlayingBeforeModal.current = true;
          currentVideo.pauseAsync();
        }
      });
    } else if (!isModalVisible && currentVideo && wasPlayingBeforeModal.current) {
      currentVideo.playAsync();
      wasPlayingBeforeModal.current = false;
    }
  }, [isModalVisible]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (currentVideoIndex.current !== newIndex && videoRefs.current[currentVideoIndex.current]) {
        videoRefs.current[currentVideoIndex.current]?.pauseAsync();
      }
      if (videoRefs.current[newIndex] && !isModalVisible) {
        videoRefs.current[newIndex]?.playAsync();
      }
      currentVideoIndex.current = newIndex;
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const setVideoRef = (ref: Video | null, index: number) => {
    videoRefs.current[index] = ref;
  };

  const toggleNewReelModal = () => {
    setNewReelModalVisible(!isNewReelModalVisible);
  };

  const handleReelCreated = () => {
    setPage(0);
    setHasMore(true);
    fetchReels(0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {reels.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có reels để hiển thị</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={reels}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => {
            if (!item._id || item._id.startsWith('.$')) {
              console.warn('Invalid _id detected:', item._id);
              return `${index}-${item.createdAt || Date.now()}`;
            }
            return item._id.toString();
          }}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReached={loadMoreReels}
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }) => (
            <SingleReel
              reel={item}
              onCommentPress={() => openComments(item)}
              onLike={() => likeReel(item._id, item.createdBy._id)}
              setVideoRef={(ref: Video | null) => setVideoRef(ref, index)}
              userId={userID || ""}
            />
          )}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="large" color={colors.mainColor1} />
              </View>
            ) : !hasMore && reels.length > 0 ? (
              <View style={styles.loadingMoreContainer}>
                <Text style={styles.emptyText}>Đã tải hết video</Text>
              </View>
            ) : null
          }
        />
      )}

      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={35} color={colors.backGround1} style={styles.headerIcon} />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Reels</Text>
          <TouchableOpacity onPress={toggleNewReelModal}>
            <Ionicons name="add" size={35} color={colors.backGround1} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.commentContainer, { backgroundColor: colors.backGround }]}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentTitle}>
                  {calculateTotalComments(currentReel?.comments || [])} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color={colors.textColor1}  />
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
                  <Ionicons name="image" size={24} color={colors.mainColor1}  />
                </TouchableOpacity>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận..."
                  placeholderTextColor={colors.textColor3}
                  value={newReply}
                  onChangeText={setNewReply}
                />
                <TouchableOpacity onPress={handleAddComment} disabled={isCommentLoading}>
                  {isCommentLoading ? (
                    <ActivityIndicator size="small" color={colors.mainColor1} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.mainColor1}  />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <NewReel
        isModalVisible={isNewReelModalVisible}
        toggleModal={toggleNewReelModal}
        isLoading={isLoading}
        onReelCreated={handleReelCreated}
        userId={userID || ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Adjust for status bar
  },
  headerLabel: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow for text
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerIcon: {
    shadowColor: '#000', // Black shadow for icons
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.75,
    shadowRadius: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow for text
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowRadius: 2,
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
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
});
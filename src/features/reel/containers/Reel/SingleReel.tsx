import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Reels } from '../../interface/reels';
import getColor from '@/src/styles/Color';
import { Comment } from '@/src/features/reel/interface/reels';
import AsyncStorage from '@react-native-async-storage/async-storage';
import restClient from '@/src/shared/services/RestClient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReelStackParamList } from '@/src/shared/routes/ReelNavigation';
import { ActionSheetIOS } from 'react-native';
import EditModal from '@/src/features/newfeeds/components/EditModal/EditModal';
interface ReelProps {
  reel: Reels;
  onCommentPress: (reel: Reels) => void;
  onLike: () => void;
  setVideoRef: (ref: Video | null) => void;
  userId: string;
}

const colors = getColor();
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const UsersClient = restClient.apiClient.service('apis/users');
const reelsClient = restClient.apiClient.service('apis/reels');

type ReelNavigationProp = StackNavigationProp<ReelStackParamList, 'Reel'>;

export const SingleReel: React.FC<ReelProps> = ({
  reel,
  onCommentPress,
  onLike,
  setVideoRef,
  userId,
}) => {
  const navigation = useNavigation<ReelNavigationProp>();
  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLiked, setIsLiked] = useState(
    reel.emoticons?.some((emoticon) => emoticon._id === userId) ?? false
  );
  const [isVertical, setIsVertical] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editContent, setEditContent] = useState<string>('');
  const [editScope, setEditScope] = useState<string>('');
  const [editHashtags, setEditHashtags] = useState<string[]>([]);
  const isOwnPost = reel.createdBy._id === userId;

  useEffect(() => {
    setVideoRef(videoRef.current);
  }, [setVideoRef]);

  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  const openEditModal = (currentContent: string, currentScope: string, currentHashtags: string[]) => {
    setEditContent(currentContent || '');
    setEditScope(currentScope || 'Công khai');
    setEditHashtags(currentHashtags || []);
    setEditModalVisible(true);
  };

  const getCurrentUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setCurrentUserId(id);
      return id;
    } catch (err) {
      console.error('Lỗi khi lấy currentUserId:', err);
      return null;
    }
  };

  const checkFollowingStatus = async (currentUserId: string) => {
    try {
      const userData = await UsersClient.get(reel.createdBy._id);
      if (userData.success) {
        const isFollowing = userData.data.followers?.includes(currentUserId);
        setIsFollowing(isFollowing);
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra trạng thái theo dõi:', err);
      setError('Không thể kiểm tra trạng thái theo dõi');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const id = await getCurrentUserId();
      if (id && reel.createdBy._id) {
        await checkFollowingStatus(id);
      }
    };
    initialize();
  }, [reel.createdBy._id]);

  const handleFollowRequest = async () => {
    if (!currentUserId || !reel.createdBy._id) return;
    try {
      const targetUserData = await UsersClient.get(reel.createdBy._id);
      if (!targetUserData.success) {
        throw new Error('Không thể lấy dữ liệu người dùng được theo dõi');
      }

      const currentUserData = await UsersClient.get(currentUserId);
      if (!currentUserData.success) {
       robin:throw new Error('Không thể lấy dữ liệu người dùng hiện tại');
      }

      if (!isFollowing) {
        const updatedFollowers = [...(targetUserData.data.followers || []), currentUserId];
        const followerResponse = await UsersClient.patch(reel.createdBy._id, {
          followers: updatedFollowers,
        });

        const updatedFollowing = [...(currentUserData.data.following || []), reel.createdBy._id];
        const followingResponse = await UsersClient.patch(currentUserId, {
          following: updatedFollowing,
        });

        if (followerResponse.success && followingResponse.success) {
          setIsFollowing(true);
        } else {
          throw new Error('Không thể theo dõi');
        }
      } else {
        const updatedFollowers = (targetUserData.data.followers || []).filter(
          (id: string) => id !== currentUserId
        );
        const followerResponse = await UsersClient.patch(reel.createdBy._id, {
          followers: updatedFollowers,
        });

        const updatedFollowing = (currentUserData.data.following || []).filter(
          (id: string) => id !== reel.createdBy._id
        );
        const followingResponse = await UsersClient.patch(currentUserId, {
          following: updatedFollowing,
        });

        if (followerResponse.success && followingResponse.success) {
          setIsFollowing(false);
        } else {
          throw new Error('Không thể hủy theo dõi');
        }
      }
    } catch (err) {
      console.error('Lỗi khi xử lý yêu cầu theo dõi:', err);
      setError('Không thể xử lý yêu cầu theo dõi');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
      setIsError(false);

      if (status.width && status.height) {
        const videoAspectRatio = status.width / status.height;
        setIsVertical(videoAspectRatio < 1);
      }
    } else if (status.error) {
      setIsError(true);
    }
  };

  const onSeek = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
      setPosition(value);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  const handleTap = async () => {
    if (!videoRef.current) return;
    if (paused) {
      await videoRef.current.playAsync();
      setPaused(false);
      setShowControls(false);
    } else {
      await videoRef.current.pauseAsync();
      setPaused(true);
      setShowControls(true);
    }
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };



  const deleteReel = async (reelId: string) => {
    try {
      const response = await reelsClient.remove(reelId);
      if (response.success) {
        Alert.alert('Thành công', 'Bài viết đã được xóa');
        // Optionally navigate back or refresh the reel list
        navigation.goBack();
      } else {
        throw new Error('Không thể xóa bài viết');
      }
    } catch (err) {
      console.error('Lỗi khi xóa reel:', err);
      Alert.alert('Lỗi', 'Không thể xóa bài viết');
    }
  };

  const handleOptions = () => {
    if (isOwnPost) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Xóa bài viết', 'Chỉnh sửa'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              Alert.alert(
                'Xác nhận xóa',
                'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
                [
                  {
                    text: 'Hủy',
                    style: 'cancel',
                  },
                  {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => deleteReel(reel._id),
                  },
                ]
              );
              break;
            default:
              break;
          }
        }
      );
    }
  };

  const calculateTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      const replyCount = comment.replyComment?.length || 0;
      return total + 1 + replyCount;
    }, 0);
  };

  const handleAvatarPress = () => {
    if (currentUserId === reel.createdBy._id) {
      navigation.navigate('MyProfile');
    } else {
      navigation.navigate('Profile', { userId: reel.createdBy._id });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleTap} accessible={false}>
      <View style={styles.container}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: reel.photo.url }}
          resizeMode={isVertical ? ResizeMode.STRETCH : ResizeMode.CONTAIN}
          isLooping
          isMuted={isMuted}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onError={() => setIsError(true)}
        />

        {isError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không thể tải video</Text>
          </View>
        )}

        {showControls && !isError && (
          <View style={styles.controlsContainer}>
            <Slider
              style={styles.seekbar}
              value={position}
              maximumValue={duration}
              minimumValue={0}
              onSlidingComplete={onSeek}
              minimumTrackTintColor="white"
              maximumTrackTintColor="gray"
              thumbTintColor="white"
            />
            <TouchableOpacity onPress={toggleMute} style={styles.muteButton}>
              <Ionicons
                name={isMuted ? 'volume-mute' : 'volume-high'}
                size={24}
                color="white"
                style={styles.iconShadow}
              />
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.container2}>
          <View style={styles.profileContainer}>
            <View style={styles.AvatarContainer}>
              <TouchableOpacity onPress={handleAvatarPress}>
                <Image
                  source={{
                    uri:
                      reel.createdBy.avt.length > 0
                        ? reel.createdBy.avt[0].url
                        : 'https://storage.googleapis.com/kltn-hcmute/public/default/default_user.png',
                  }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <Text style={styles.nameText}>{reel.createdBy.displayName}</Text>
              {currentUserId !== reel.createdBy._id && (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    isFollowing && styles.followingButton,
                  ]}
                  onPress={handleFollowRequest}
                >
                  <Text
                    style={[
                      styles.followText,
                      isFollowing && styles.followingText,
                    ]}
                  >
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.descriptionText}>{reel.content}</Text>
          </View>

          <View style={styles.iconGroup}>
            <TouchableOpacity style={styles.iconContainer} onPress={handleLike}>
              <Ionicons
                name="heart"
                size={35}
                color={isLiked ? 'red' : 'white'}
                style={styles.iconShadow}
              />
              <Text style={styles.iconText}>
                {reel.emoticons?.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => onCommentPress(reel)}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={35}
                color="white"
                style={styles.iconShadow}
              />
              <Text style={styles.iconText}>
                {calculateTotalComments(reel?.comments || []) || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconContainer}
              onPress={handleOptions}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={35}
                color="white"
                style={styles.iconShadow}
              />
            </TouchableOpacity>
          </View>
        </View>    
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 3,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seekbar: {
    flex: 1,
    height: 30,
    marginBottom: 20,
  },
  muteButton: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  container2: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  profileContainer: {
    position: 'absolute',
    bottom: 35,
    left: 15,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  AvatarContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 10,
  },
  followButton: {
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  followingButton: {
    backgroundColor: colors.mainColor1,
  },
  followText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  followingText: {
    color: colors.white_homologous,
  },
  iconGroup: {
    position: 'absolute',
    right: 5,
    bottom: 2,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.75,
    shadowRadius: 2,
  },
  nameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  descriptionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
    width: '100%',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: {
    position: 'absolute',
    top: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
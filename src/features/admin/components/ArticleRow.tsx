import { NewFeedParamList } from '@/src/shared/routes/NewFeedNavigation';
import getColor from '@/src/styles/Color';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { Article } from '../interface';

interface ArticleRowProps {
  article: Article;
  onPress: () => void; // Mở báo cáo
}

type NewFeedNavigationProp = StackNavigationProp<NewFeedParamList>;

const { width } = Dimensions.get('window');
const MEDIA_SIZE = width * 0.22; // Kích thước media item nhỏ hơn để hiển thị nhiều hơn
const MAX_MEDIA_ITEMS = 4; // Giới hạn số lượng media hiển thị

const ArticleRow: React.FC<ArticleRowProps> = ({ article, onPress }) => {
  const colors = getColor();
  const hasReports = article.reports && article.reports.length > 0;
  const navigation = useNavigation<NewFeedNavigationProp>();

  // Lọc ảnh và video từ listPhoto, giới hạn tối đa MAX_MEDIA_ITEMS
  const mediaItems = article.listPhoto
    ?.slice(0, MAX_MEDIA_ITEMS)
    .map((photo) => ({
      url: photo.url,
      type: photo.type,
      isVideo: photo.type === 'video',
    })) || [];

  // Trạng thái phát/tạm dừng video
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<(Video | null)[]>([]);

  // Trạng thái cho menu long press
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  const toggleVideoPlayback = async (url: string, index: number) => {
    const videoRef = videoRefs.current[index];
    if (!videoRef) return;

    if (playingVideo === url) {
      await videoRef.pauseAsync();
      setPlayingVideo(null);
    } else {
      for (let i = 0; i < videoRefs.current.length; i++) {
        if (i !== index && videoRefs.current[i]) {
          await videoRefs.current[i]?.pauseAsync();
        }
      }
      await videoRef.playAsync();
      setPlayingVideo(url);
    }
  };

  const handleViewDetail = () => {
    navigation.navigate('ArticleDetail', { articleId: article._id });
    closeMenu();
  };

  // Animation cho menu
  const openMenu = () => {
    setMenuVisible(true);
    Animated.spring(menuAnimation, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.spring(menuAnimation, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const menuStyle = {
    opacity: menuAnimation,
    transform: [
      {
        scale: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={openMenu}
        style={[
          styles.card,
          {
            backgroundColor: hasReports ? '#FFF1F1' : colors.backGround,
            borderLeftColor: hasReports ? '#FF3B30' : colors.borderColor1,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.cardContainer}>
          {mediaItems.length > 0 && (
            <View style={styles.mediaContainer}>
              {mediaItems.map((item, index) => (
                <View key={index} style={styles.mediaItem}>
                  {item.isVideo ? (
                    <TouchableOpacity
                      onPress={() => toggleVideoPlayback(item.url, index)}
                      activeOpacity={0.8}
                    >
                      <Video
                        ref={(ref) => {
                          videoRefs.current[index] = ref;
                        }}
                        source={{ uri: item.url }}
                        style={styles.mediaImage}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        useNativeControls={false}
                        isLooping
                      />
                      {playingVideo !== item.url && (
                        <View style={styles.playOverlay}>
                          <Ionicons name="play-circle" size={32} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <Image
                      source={{ uri: item.url || 'https://via.placeholder.com/100' }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                  )}
                  {mediaItems.length > MAX_MEDIA_ITEMS && index === MAX_MEDIA_ITEMS - 1 && (
                    <View style={styles.moreMediaOverlay}>
                      <Text style={styles.moreMediaText}>
                        +{article.listPhoto!.length - MAX_MEDIA_ITEMS}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textColor3 }]}>ID:</Text>
              <Text style={[styles.value, { color: colors.textColor1 }]}>
                {article._id.slice(-6)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textColor3 }]}>Nội dung:</Text>
              <Text
                style={[styles.value, { color: colors.textColor1 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {article.content || 'Không có nội dung'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textColor3 }]}>Báo cáo:</Text>
              <View style={styles.reportContainer}>
                {hasReports ? (
                  <>
                    <Ionicons name="warning" size={16} color="#FF3B30" style={styles.reportIcon} />
                    <Text style={[styles.value, { color: '#FF3B30' }]}>
                      {article.reports?.length} báo cáo
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.value, { color: colors.textColor1 }]}>Không</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Menu khi long press */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.menuContainer, menuStyle]}>
              <TouchableOpacity style={styles.menuItem} onPress={handleViewDetail}>
                <Text style={[styles.menuText, { color: colors.textColor1 }]}>
                  Xem bài viết chi tiết
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={onPress}>
                <Text style={[styles.menuText, { color: colors.textColor1 }]}>Xem báo cáo</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  card: {
    marginHorizontal: 12,
    borderRadius: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    padding: 12,
  },
  cardContainer: {
    flexDirection: 'column',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  mediaItem: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  mediaImage: {
    width: MEDIA_SIZE,
    height: MEDIA_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: getColor().borderColor1,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  moreMediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  moreMediaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
    color: getColor().textColor3,
    lineHeight: 20,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    color: getColor().textColor1,
    lineHeight: 20,
  },
  reportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  menuContainer: {
    backgroundColor: getColor().backGround,
    borderRadius: 12,
    padding: 8,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ArticleRow;
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

const VideoPlayer = () => {
  const videoRef = React.useRef(null);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={require('@/src/assets/videos/test-collection.mp4')}
        resizeMode={ResizeMode.COVER}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%', height: '100%',
  },
});

export default VideoPlayer;

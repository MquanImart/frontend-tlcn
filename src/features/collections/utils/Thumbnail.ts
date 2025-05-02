import * as VideoThumbnails from 'expo-video-thumbnails';

const generateThumbnailUrl = async (videoUri: string) => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000,
    });
    return uri;
  } catch (e) {
    console.warn(e);
    return null;
  }
};


const generateThumbnailsInBatches = async (videos: string[], batchSize: number) => {
  const results: (string | null)[] = [];
  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((videoUri) => generateThumbnailUrl(videoUri))
    );
    results.push(...batchResults);
  }
  return results;
};


export {generateThumbnailUrl, generateThumbnailsInBatches};

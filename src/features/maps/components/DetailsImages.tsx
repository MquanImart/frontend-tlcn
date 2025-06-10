import env from "@/env";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PlaceData } from "../containers/interfaceAPI";

interface DetailsImagesProps {
  details: PlaceData;
}
const DetailsImages = ({details} : DetailsImagesProps) => {
  useTheme();
  const [images, setImages] = useState<string | null>(null);

  useEffect(() => {
    if (details.photos && details.photos.length > 0){
      setImages(getImagesDefault(details.photos[0].name));
    } else {
      setImages(null)
    }
  }, [details]);

  const getImagesDefault = (photo_reference: string) => {
    return `https://places.googleapis.com/v1/${photo_reference}/media?key=${env.GOOGLE_MAPS_API_KEY}&maxWidthPx=400`;
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={images? {uri: images} : require('@/src/assets/images/default/default_location.png')} style={styles.image} />
      </View>
      <View style={styles.boxInfor}>
      {details.websiteUri && (
        <TouchableOpacity onPress={() => Linking.openURL(details.websiteUri?details.websiteUri:"")} style={styles.link}>
          <Text style={[styles.linkText, { color: Color.textOnMain2 }]}>🌍 Website</Text>
        </TouchableOpacity>
      )}

      {details.googleMapsUri && (
        <TouchableOpacity onPress={() => Linking.openURL(details.googleMapsUri?details.googleMapsUri:"")} style={styles.link}>
          <Text style={[styles.linkText, { color: Color.textOnMain2 }]}>📍 Google Map</Text>
        </TouchableOpacity>
      )}

      {details.googleMapsLinks && (
        <TouchableOpacity onPress={() => Linking.openURL(details.googleMapsLinks.reviewsUri?details.googleMapsLinks.reviewsUri:"")} style={styles.link}>
          <Text style={[styles.linkText, { color: Color.textOnMain2 }]}>⭐ Đánh giá</Text>
        </TouchableOpacity>
      )}
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', height: 150,
    justifyContent: "space-between",
    flexDirection: 'row',
    alignItems: "center",
    marginVertical: 10
  },
  imageContainer: {
    marginRight: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  boxInfor: {

  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Color.mainColor2,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
  },
  linkText: {
    // color handled inline
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetailsImages;
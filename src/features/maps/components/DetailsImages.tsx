import React, { useEffect, useState } from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { PlaceData } from "../containers/interfaceAPI";
import getColor from "@/src/styles/Color";
import { callGetGoogleApi } from "@/src/shared/services/API_Google";
import env from "@/env";

interface DetailsImagesProps {
  details: PlaceData;
}
const DetailsImages = ({details} : DetailsImagesProps) => {

  const [images, setImages] = useState<string | null>(null);

  useEffect(() => {
    if (details.photos && details.photos.length > 0){
      setImages(getImagesDefault(details.photos[0].name));
    } else {
      setImages("https://picsum.photos/200")
    }
  }, [details]);

  const getImagesDefault = (photo_reference: string) => {
    return `https://places.googleapis.com/v1/${photo_reference}/media?key=${env.GOOGLE_MAPS_API_KEY}&maxWidthPx=400`;
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{uri: images? images : "https://picsum.photos/200"}} style={styles.image} />
      </View>
      <View style={styles.boxInfor}>
      {details.websiteUri && (
        <TouchableOpacity onPress={() => Linking.openURL(details.websiteUri?details.websiteUri:"")} style={styles.link}>
          <Text style={styles.linkText}>🌍 Website</Text>
        </TouchableOpacity>
      )}

      {details.googleMapsUri && (
        <TouchableOpacity onPress={() => Linking.openURL(details.googleMapsUri?details.googleMapsUri:"")} style={styles.link}>
          <Text style={styles.linkText}>📍 Google Map</Text>
        </TouchableOpacity>
      )}

      {details.googleMapsLinks && (
        <TouchableOpacity onPress={() => Linking.openURL(details.googleMapsLinks.reviewsUri?details.googleMapsLinks.reviewsUri:"")} style={styles.link}>
          <Text style={styles.linkText}>⭐ Đánh giá</Text>
        </TouchableOpacity>
      )}
    </View>
    </View>
  );
};

const Color = getColor();
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
    backgroundColor: Color.mainColor1,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetailsImages;

export interface PlaceText {
    text: string;
    languageCode: string;
}
  
export interface StructuredFormat {
    mainText: string;
    secondaryText: string;
}
  
export interface PlacePrediction {
    place: string;
    placeId: string;
    structuredFormat: StructuredFormat;
    text: PlaceText;
    types: string[];
}
  
export interface PlaceSuggestion {
    placePrediction: PlacePrediction;
}

export interface AddressComponent {
    languageCode: string;
    longText: string;
    shortText: string;
    types: string[];
}
  
export interface DisplayName {
    languageCode: string;
    text: string;
}
  
export interface GoogleMapsLinks {
    directionsUri: string;
    photosUri: string;
    placeUri: string;
    reviewsUri: string;
}
  
export interface Location {
    latitude: number;
    longitude: number;
}
  
export interface Photo {
    authorAttributions: any[];
    flagContentUri: string;
    googleMapsUri: string;
    heightPx: number;
    name: string;
    widthPx: number;
}

export interface Time {
    day: number;
    hour: number;
    minute: number;
}
  
export interface Period {
    open: Time;
    close: Time;
}
  
export interface RegularOpeningHours {
    openNow: boolean;
    periods: Period[];
    weekdayDescriptions: string[];
    nextCloseTime: string;
}
  
  
export interface PlaceData {
    id: string;
    name: string;
    types: string[];
    nationalPhoneNumber: string;
    formattedAddress: string;
    addressComponents: AddressComponent[];
    rating: number;
    googleMapsUri?: string;
    websiteUri?: string;
    regularOpeningHours: RegularOpeningHours;
    adrFormatAddress: string;
    displayName: DisplayName;
    googleMapsLinks: GoogleMapsLinks;
    location: Location;
    photos: Photo[];
    photosUri?: string;
}
  
export interface Place {
    id: string;
    displayName: {
      text: string;
      languageCode: string;
    };
    location: {
      latitude: number;
      longitude: number;
    };
}
  
export interface NearbySearchResponse {
    places: Place[];
}
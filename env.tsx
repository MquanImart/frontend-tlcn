import Constants from 'expo-constants';

const {
  URL_BACKEND,
  GOOGLE_MAPS_API_KEY,
  API_URL_CHECK_TOXIC,
  API_KEY_CHECK_TOXIC,
  GEMINI_API_KEY
} = Constants.expoConfig?.extra || {};

const env = {
  URL_BACKEND,
  GOOGLE_MAPS_API_KEY,
  API_URL_CHECK_TOXIC,
  API_KEY_CHECK_TOXIC,
  GEMINI_API_KEY
};

export default env;

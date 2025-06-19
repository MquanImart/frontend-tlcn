import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    URL_BACKEND: process.env.URL_BACKEND,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    API_URL_CHECK_TOXIC: process.env.API_URL_CHECK_TOXIC,
    API_KEY_CHECK_TOXIC: process.env.API_KEY_CHECK_TOXIC,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
  }
});

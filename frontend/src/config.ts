console.log(import.meta.env.VITE_APP_BASEURL);

const config = {
    baseURL: 'http://localhost:5000/api/',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  export const baseURL = config.baseURL;
  export default config;
  
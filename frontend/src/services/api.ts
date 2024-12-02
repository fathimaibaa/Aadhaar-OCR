import axios from "axios";
import config from "../config";

export const api = axios.create({
  baseURL: config.baseURL,
  headers: config.headers,
  withCredentials: true,
});

api.interceptors.request.use(
    async (config:any) => {
  
  
  
      const authToken = localStorage.getItem('userToken');
         
      if (authToken) {
       
      config.headers['Authorization'] = `Bearer ${authToken}`;
      }
  
  
      return config;
    },
    async (error:Error) => {
      return Promise.reject(error);
    }
  );
import { api } from "./api";

export const apiCalls = async (method: string, url: string, data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response: any, error: any;

      if (method === 'post') {
        
        response = await api.post(url, data).catch((err) => {
          error = err;
        });
      } else if (method === 'get') {
        response = await api.get(url, data).catch((err) => {
          error = err;
        });
      } else if (method === 'put') {
        response = await api.put(url, data).catch((err) => {
          error = err;
        });
      } else if (method === 'delete') {
        response = await api.delete(url,  data ).catch((err) => {
          error = err;
        });
      } else if (method === 'patch') {
        response = await api.patch(url, data).catch((err) => {
          error = err;
        });
      }

      if (error) {
        console.log(error);
        reject(error?.response?.data);
        if (error.response?.status === 401) {
          console.log('not authorized');
        }
      } else {
        resolve(response);
      }
    } catch (err) {
      reject(err);
    }
  });
};

export default apiCalls
import { axiosInstance, ENDPOINTS } from "@/lib/utils";

export function loginEmailService(email: string, password: string) {
  return axiosInstance.post(ENDPOINTS.AUTH.LOGIN, { email, password })
  .then(response => response.data);
} 

export function registerEmailService(email: string, password: string, fullName: string) {
  return axiosInstance.post(ENDPOINTS.AUTH.REGISTER, { email, password, fullName })
  .then(response => response.data);
}

export function logoutAccount() {
  return axiosInstance.post(ENDPOINTS.AUTH.LOGOUT)
  .then(response => response.data);
}

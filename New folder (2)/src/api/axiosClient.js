import axios from 'axios'
import { getToken } from '../utils/authUtils'

/**
 * Pre-configured Axios instance for the SNIIPE Flask backend.
 * Base URL points to the Flask server.
 * All future API calls should use this client.
 */
const axiosClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies for session auth
})

// Request interceptor — attach auth token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle global errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Future: redirect to login
      console.warn('Unauthorized — redirect to login')
    }
    return Promise.reject(error)
  }
)

export default axiosClient

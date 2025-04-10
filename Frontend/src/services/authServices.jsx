import axios from 'axios';
const API_URL = 'http://localhost:5000/api/v1';

class AuthService {
  // Login vendor and store JWT
  static async login(uniqueID, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        uniqueID,
        password
      });

      if (response.data.token) {
        localStorage.setItem('vendor', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  // Logout vendor
  static logout() {
    localStorage.removeItem('vendor');
  }

  // Get current vendor
  static getCurrentVendor() {
    const vendor = localStorage.getItem('vendor');
    return vendor ? JSON.parse(vendor) : null;
  }

  // Get JWT token
  static getToken() {
    const vendor = this.getCurrentVendor();
    return vendor?.token;
  }

  // Check if vendor is authenticated
  static isAuthenticated() {
    return !!this.getToken();
  }

  // Get vendor permissions
  static async getVendorPermissions() {
    try {
      const token = this.getToken();
      const response = await axios.get(`${API_URL}/vendors/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch permissions' };
    }
  }
}

export default AuthService; 
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/v1'

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    console.log('Registration response:', response.data)
    return response.data
    
  } catch (error) {
    throw error.response?.data?.message || 'Registration failed'
  }
}

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, 
      { email, password },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    )
    console.log('Login response:', response.data)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Login failed'
  }
}

export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`, {}, {
      withCredentials: true
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || 'Logout failed'
  }
}
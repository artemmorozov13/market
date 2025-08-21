import axios from 'axios'

const BASE_URL = 'http://localhost:3000'

export const fetchUserProfile = async () => {
  const response = await axios.get(`${BASE_URL}/profile`)
  return response.data
}

export const saveUserProfile = async (data: any) => {
  const response = await axios.put(`${BASE_URL}/profile`, data)
  return response.data
}

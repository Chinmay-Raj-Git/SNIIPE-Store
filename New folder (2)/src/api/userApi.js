import axiosClient from './axiosClient'

export async function getUserProfile() {
  const { data } = await axiosClient.get('/profile/me')
  return data
}

export async function updateUserProfile({ name, phone, whatsapp_opt_in }) {
  const { data } = await axiosClient.put('/profile/me', { name, phone, whatsapp_opt_in })
  return data
}

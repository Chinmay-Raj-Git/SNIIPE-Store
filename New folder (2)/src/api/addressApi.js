import axiosClient from './axiosClient'

/**
 * addressApi.js
 *
 * GET  /addresses                       → { addresses: [...] }
 * POST /addresses                       → { message }
 * PUT  /addresses/<id>/default          → { message }
 * DELETE /addresses/<id>                → { message }
 *
 * Address shape:
 *   { id, label, full_name, phone, address_line_1, address_line_2,
 *     city, state, pincode, is_default }
 */

export async function apiFetchAddresses() {
  const { data } = await axiosClient.get('/addresses')
  return data.addresses ?? []
}

export async function apiAddAddress(payload) {
  // payload: { full_name, phone, address_line_1, address_line_2?, city, state, pincode, label? }
  const { data } = await axiosClient.post('/addresses', payload)
  return data
}

export async function apiSetDefaultAddress(addressId) {
  const { data } = await axiosClient.put(`/addresses/${addressId}/default`)
  return data
}

export async function apiDeleteAddress(addressId) {
  const { data } = await axiosClient.delete(`/addresses/${addressId}`)
  return data
}

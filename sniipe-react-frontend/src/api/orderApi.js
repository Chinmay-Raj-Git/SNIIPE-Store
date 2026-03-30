import axiosClient from './axiosClient'

export async function apiFetchOrders() {
  const { data } = await axiosClient.get('/orders')
  return data
}

export async function apiFetchOrderDetail(orderId) {
  const { data } = await axiosClient.get(`/orders/${orderId}`)
  return data
}

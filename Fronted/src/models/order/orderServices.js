import api from '../api'

export const orderServices = {
  create: async (orderData) => api.post('/orders', orderData),
  getMyOrders: async (limit = 20) => api.get(`/orders?limit=${limit}`),
  getActiveOrders: async () => api.get('/orders/active'),
  getById: async (orderId) => api.get(`/orders/${orderId}`),
  cancel: async (orderId) => api.put(`/orders/${orderId}/cancel`)
}

export default orderServices
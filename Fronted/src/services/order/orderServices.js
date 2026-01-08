import api from '../api'

export const orderServices = {
  create: async (orderData) => {
    return await api.post('/orders', orderData)
  },

  getMyOrders: async (limit = 20) => {
    return await api.get(`/orders?limit=${limit}`)
  },

  getActiveOrders: async () => {
    return await api.get('/orders/active')
  },

  getById: async (orderId) => {
    return await api.get(`/orders/${orderId}`)
  },

  cancel: async (orderId) => {
    return await api.put(`/orders/${orderId}/cancel`)
  }
}

export default orderServices
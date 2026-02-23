export const generateOrderCode = () => {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}-${random}`
}


export default function (digits = 6, type: 'numeric' | 'alphanumeric' = 'numeric'): string {
  if (type === 'numeric') {
    const min = Number.parseInt(`1${'0'.repeat(digits - 1)}`)
    const max = Number.parseInt('9'.repeat(digits))
    return `${Math.floor(Math.random() * (max - min + 1)) + min}`
  } else {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < digits; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

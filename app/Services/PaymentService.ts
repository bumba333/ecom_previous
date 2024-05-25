// app/Services/PaymentService.ts

import Wallet from 'App/Models/Wallet'

export default class PaymentService {
  public static async handlePayment(user, cart, paymentMethod) {
    if (paymentMethod === 'wallet') {
      return this.handleWalletPayment(user, cart)
    }
    // Handle other payment methods
    return null // Return a response or error handling for other methods
  }

  public static async handleWalletPayment(user, cart) {
    const wallet = await Wallet.query().where('user_id', user.id).first()

    if (!wallet) {
      return { success: false, message: 'Wallet not found' }
    }

    const totalAmount = this.calculateTotalAmount(cart)

    if (totalAmount > wallet.balance) {
      return { success: false, message: 'Insufficient wallet balance' }
    }

    // Deduct the order total from the wallet balance
    wallet.balance -= totalAmount
    await wallet.save()

    return { success: true }
  }

  public static calculateTotalAmount(cart) {
    let totalAmount = 0
    for (const cartItem of cart.items) {
      totalAmount += cartItem.subtotal
    }
    return totalAmount
  }
}

// DiscountService.ts

export default class DiscountService {
  public static calculateDiscountedAmount(totalAmount: number, coupon) {
    if (coupon) {
      // Calculate the discounted amount based on the coupon type (e.g., percentage or fixed)
      if (coupon.discountType === 'percentage') {
        const discountPercentage = coupon.discountValue
        const discount = (discountPercentage / 100) * totalAmount
        return totalAmount - discount
      } else if (coupon.discountType === 'fixed') {
        const discount = coupon.discountValue
        return totalAmount - discount
      }
    } else {
      return totalAmount // No discount applied
    }
  }
}

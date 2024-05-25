import Cart from 'App/Models/Cart'
import Coupon from 'App/Models/Coupon'
import DiscountService from './DiscountService'

export default class CouponService {
  /**
   * Apply a coupon to the cart and calculate the discounted amount.
   * @param cart - The cart to which the coupon should be applied.
   * @param couponCode - The coupon code to apply.
   */
  public async applyCouponToCart(cart: Cart, couponCode: string): Promise<void> {
    const coupon = await Coupon.findBy('code', couponCode)

    if (!coupon) {
      throw new Error('Coupon not found')
    }

    if (coupon.expiresAt && coupon.expiresAt.toJSDate() < new Date()) {
      throw new Error('This coupon has expired')
    }

    if (!this.canApplyCouponToCart(coupon, cart)) {
      throw new Error('Coupon cannot be applied to the cart')
    }
    cart.couponCode = couponCode
    // Calculate the discount and update the cart
    updateDiscountedValueInCart(cart, coupon)
  }

  /**
   * Check if the coupon can be applied to the cart based on additional criteria.
   * You can implement custom logic here, such as checking if the cart meets
   * minimum order requirements, etc.
   * @param coupon - The coupon to be applied.
   * @param cart - The cart to which the coupon should be applied.
   * @returns True if the coupon can be applied, false otherwise.
   */
  public canApplyCouponToCart(coupon: Coupon, cart: Cart): boolean {
    // Check if the coupon is expired
    if (coupon.expiresAt && coupon.expiresAt.toJSDate() < new Date()) {
      return false
    }

    // Check if the coupon has reached its usage limit (if defined)
    if (coupon.usageLimit !== null && coupon.usageLimit <= coupon.usedCount) {
      return false
    }

    // Check if the cart total meets the minimum order amount required by the coupon
    if (
      coupon.minOrderAmount !== null &&
      (cart.totalAmount === null || cart.totalAmount < coupon.minOrderAmount)
    ) {
      return false
    }

    // If all checks passed, the coupon can be applied
    return true
  }
}

export function updateDiscountedValueInCart(cart: Cart, coupon: Coupon | null) {
  // Calculate the discount based on the coupon type (fixed or percentage)
  let discountedAmount = DiscountService.calculateDiscountedAmount(cart.totalAmount, coupon)

  // Update the cart with the discounted
  if (discountedAmount) {
    cart.discountedAmount = discountedAmount
  }
  cart.save()
}

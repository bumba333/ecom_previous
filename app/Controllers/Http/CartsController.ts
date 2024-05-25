import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import CartItem from 'App/Models/CartItem'
import Coupon from 'App/Models/Coupon'
import CartService from 'App/Services/CartService'
import CouponService from 'App/Services/CouponService'
import { updateDiscountedValueInCart } from 'App/Services/CouponService'

export default class CartController {
  public async addToCart({ request, response, auth }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      throw new Error('User not found')
    }

    const productId = request.input('productId')
    const productVariationId = request.input('productVariationId')
    const quantity = request.input('quantity', 1)
    const couponCode = request.input('coupon')

    const cartService = new CartService()
    const couponService = new CouponService() // Create an instance of your CouponService

    // Get or create the user's cart
    const cart = await cartService.getOrCreateCart(user.id)

    // Check if the product is already in the cart
    const existingCartItem = await cartService.findCartItem(cart, productId, productVariationId)

    if (existingCartItem) {
      // If the product is already in the cart, increase the quantity
      existingCartItem.quantity += quantity
      await existingCartItem.save()
    } else {
      // If the product is not in the cart, create a new cart item
      await cartService.createCartItem(cart, productId, productVariationId, quantity)
    }

    // Calculate and update the total amount for the cart
    await cartService.calculateAndUpdateTotalAmount(cart)

    // Apply the coupon to the cart (assuming you have a method for this in CouponService)
    if (couponCode) {
      const coupon = await Coupon.findBy('code', couponCode)
      if (coupon) {
        if (couponService.canApplyCouponToCart(coupon, cart)) {
          // Apply the coupon to the cart
          // You should have a method in your CouponService for this
          const discountedAmount = await couponService.applyCouponToCart(cart, couponCode)
          cart.save()
          return response.status(200).json({
            cart,
            message: 'Product added Successfully',
            discountedAmount,
          })
        } else {
          // The coupon cannot be applied to the cart
          updateDiscountedValueInCart(cart, coupon)
          return response.status(400).json({
            message: 'Coupon cannot be applied to the cart',
            cart: cart,
          })
        }
      } else {
        // Coupon not found
        updateDiscountedValueInCart(cart, coupon)
        return response.status(404).json({
          message: 'Coupon not found',
          cart: cart,
        })
      }
    }
    updateDiscountedValueInCart(cart, null)
    return response.status(200).json({ cart, message: 'Product added Successfully' })
  }

  public async updateItemQuantity({ request, response, auth }: HttpContextContract) {
    const user = auth.user

    if (!user) {
      throw new Error('User not found')
    }

    const cartItemId = request.input('cartItemId')
    const quantity = request.input('quantity')
    if (quantity === 0) {
      response.status(200).json({ message: 'Kindly Delete Cart Item' })
    }

    const cartService = new CartService()

    // Get the user's cart
    const cart = await Cart.findByOrFail('user_id', user.id)

    // Check if the item is in the cart
    const cartItem = await CartItem.findOrFail(cartItemId)

    if (!cartItem) {
      return response.status(404).json({
        message: 'Cart item not found',
      })
    }

    // Update the quantity
    cartItem.quantity = quantity
    await cartItem.save()

    // Recalculate the total amount for the cart
    await cartService.calculateAndUpdateTotalAmount(cart)
    const coupon = await Coupon.findBy('code', cart.couponCode)
    updateDiscountedValueInCart(cart, coupon)

    return response.status(200).json({
      message: 'Item quantity updated successfully',
      cart,
    })
  }

  public async removeItem({ auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { cartItemId } = request.only(['cartItemId'])
    const cart = await Cart.findBy('user_id', user.id)
    const cartService = new CartService()
    const couponService = new CouponService()

    if (!cart) {
      return response.status(404).json({ message: 'Cart not found' })
    }

    try {
      const item = await CartItem.find(cartItemId)

      if (!item) {
        return response.status(404).json({ message: 'Item not found' })
      }

      await item.delete()
      const remainingItems = await CartItem.query().where('cart_id', cart.id)

      if (remainingItems.length === 0) {
        await cart.delete()
        return response.status(200).json({ message: 'No Items in Cart' })
      }

      await cartService.calculateAndUpdateTotalAmount(cart)

      if (cart.couponCode) {
        await couponService.applyCouponToCart(cart, cart.couponCode)
      }

      return response.status(200).json({ message: 'Item removed from cart successfully' })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Failed to remove item from cart', error: error.message })
    }
  }

  public async getCart({ auth, response }: HttpContextContract) {
    const user = auth.user!
    /* const { cartId } = request.only(['cartId']) */
    // eslint-disable-next-line no-debugger
    const cart = await Cart.query()
      .where('user_id', user.id)
      .preload('items', (query) => {
        query.preload('product').preload('productVariation', (q) => {
          q.preload('images')
        })
      })
      .first()
    if (!cart) {
      return response.status(200).json('No Items in Cart')
    }
    return response.status(200).json({ cart })
  }
}

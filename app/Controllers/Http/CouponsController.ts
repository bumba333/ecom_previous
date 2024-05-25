import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cart from 'App/Models/Cart'
import Coupon from 'App/Models/Coupon'
import Order from 'App/Models/Order'
import User from 'App/Models/User'
import CouponService from 'App/Services/CouponService'
import DiscountService from 'App/Services/DiscountService'

export default class CouponsController {
  //CREATE COUPON ADMIN
  public async createCoupon({ request, response }) {
    try {
      const couponData = request.only([
        'code',
        'discountType',
        'discountValue',
        'isForSpecificUser', // Include the flag for user-specific coupons
        'usageLimit',
        'minOrderAmount',
        'expiresAt',
      ])

      // Create the coupon
      const coupon = await Coupon.create(couponData)

      return response.status(201).json({
        status: 'success',
        message: 'Coupon created successfully.',
        coupon,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while creating the coupon.',
        error: error.message,
      })
    }
  }

  // EDIT COUPON ADMIN
  public async editCoupon({ params, request, response }) {
    try {
      const couponId = params.id
      const couponData = request.only([
        'code',
        'discountType',
        'discountValue',
        'isForSpecificUser', // Include the flag for user-specific coupons
        'usageLimit',
        'minOrderAmount',
        'expiresAt',
      ])

      // Find the coupon by ID
      const coupon = await Coupon.find(couponId)

      if (!coupon) {
        return response.status(404).json({
          status: 'error',
          message: 'Coupon not found.',
        })
      }

      // Update the coupon
      coupon.merge(couponData)
      await coupon.save()

      return response.status(200).json({
        status: 'success',
        message: 'Coupon updated successfully.',
        coupon,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while updating the coupon.',
        error: error.message,
      })
    }
  }

  //DELETE COUPON ADMIN
  public async deleteCoupon({ params, response }) {
    try {
      const couponId = params.id

      // Find the coupon by ID
      const coupon = await Coupon.find(couponId)

      if (!coupon) {
        return response.status(404).json({
          status: 'error',
          message: 'Coupon not found.',
        })
      }

      // Delete the coupon
      await coupon.delete()

      return response.status(200).json({
        status: 'success',
        message: 'Coupon deleted successfully.',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while deleting the coupon.',
        error: error.message,
      })
    }
  }

  //APPLY COUPON
  public async applyCoupon({ request, response, auth }) {
    try {
      const user = await auth.user
      const { code } = request.only(['code'])
      const couponService = new CouponService()

      // Check if the user is authenticated
      if (!user) {
        return response.status(401).json({
          status: 'error',
          message: 'You must be logged in to apply a coupon.',
        })
      }
      // Find the coupon by code
      const coupon = await Coupon.findBy('code', code)
      // Fetch the user's cart with cart items
      const cart = await Cart.query()
        .where('user_id', user.id)
        .preload('items', (query) => {
          query.preload('product').preload('productVariation')
        })
        .firstOrFail()

      // Check if the coupon exists
      if (!coupon) {
        return response.status(404).json({
          status: 'error',
          message: 'Coupon not found.',
        })
      } else {
        couponService.applyCouponToCart(cart, code)
      }

      // Check if the user has already used this coupon
      const orderWithCoupon = await Order.query()
        .where('user_id', user.id)
        .where('coupon_code', coupon.code)
        .first()

      if (orderWithCoupon) {
        return response.status(400).json({
          status: 'error',
          message: 'You have already used this coupon.',
        })
      }

      // Check if a coupon is applicable to a user or anyone.
      if (coupon.isForSpecificUser) {
        // Check if the authenticated user is assigned to this coupon
        if (!user || !(await coupon.related('users').query().where('users.id', user.id).first())) {
          return response.status(403).json('This coupon is not applicable to you.')
        }
      }

      // Apply the coupon to the user's order (you may need to adjust this logic)
      // For example, you might want to calculate the discounted total price of the order here.

      // Calculate the total amount for the order based on cart items and quantities
      let totalAmount = 0
      for (const cartItem of cart.items) {
        totalAmount += cartItem.subtotal
      }

      if (coupon) {
        // Apply coupon discount to the order totalAmount
        const discountedAmount = DiscountService.calculateDiscountedAmount(totalAmount, coupon)
        if (discountedAmount) {
          cart.discountedAmount = discountedAmount
        }
        cart.save()
        return response.status(200).json({
          status: 'success',
          message: 'Coupon applied successfully.',
          totalAmount,
          discountedAmount,
        })
      }
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while applying the coupon.',
        error: error.message,
      })
    }
  }

  //REMOVE COUPON ADMIN
  public async removeCoupon({ response, auth }) {
    try {
      const user = await auth.getUser()

      // Check if the user is authenticated
      if (!user) {
        return response.status(401).json({
          status: 'error',
          message: 'You must be logged in to remove a coupon.',
        })
      }

      // Remove the coupon from the user's order (you need to implement this logic)

      return response.status(200).json({
        status: 'success',
        message: 'Coupon removed successfully.',
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'An error occurred while removing the coupon.',
        error: error.message,
      })
    }
  }

  //LIST COUPONS
  public async listCoupon({ response }) {
    const couponList = await Coupon.all()
    return response.status(200).json({ couponList })
  }

  //Assign a coupon to users
  public async assignCouponToUsers({ params, request, response }: HttpContextContract) {
    const couponId = params.id // Get the coupon's ID from the route parameters

    // Find the coupon by ID
    const coupon = await Coupon.find(couponId)

    if (!coupon) {
      return response.notFound('Coupon not found')
    }

    // Get an array of user IDs from the request
    const userIds = request.input('userIds')

    // Attach users to the coupon
    await coupon.related('users').attach(userIds) // Use the array of user IDs directly

    return response.ok('Users assigned to the coupon successfully')
  }

  // Assign coupons to a user
  public async assignCouponsToUser({ params, request, response }: HttpContextContract) {
    const userId = params.id // Get the user's ID from the route parameters

    // Find the user by ID
    const user = await User.find(userId)

    if (!user) {
      return response.notFound('User not found')
    }

    // Get an array of coupon IDs from the request
    const couponIds = request.input('couponIds')

    // Attach coupons to the user
    await user.related('coupons').attach(couponIds) // Use the array of coupon IDs directly

    return response.ok('Coupons assigned to the user successfully')
  }
}

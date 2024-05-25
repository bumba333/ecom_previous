// app/Controllers/Http/WishlistController.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Wishlist from 'App/Models/Wishlist'

export default class WishlistController {
  public async index({ auth }: HttpContextContract) {
    const user = auth.user!
    const wishlist = await Wishlist.query().where('user_id', user.id).preload('product')
    return wishlist
  }

  public async store({ auth, request, response }: HttpContextContract) {
    const user = auth.user!
    const { productId } = request.only(['productId'])

    // Check if the product is already in the wishlist for the user
    const existingWishlistItem = await Wishlist.query()
      .where('user_id', user.id)
      .where('product_id', productId)
      .first()

    if (existingWishlistItem) {
      return response.status(400).json({
        message: 'Product already exists in the wishlist.',
      })
    }

    // If the product is not already in the wishlist, add it
    const wishlistItem = new Wishlist()
    wishlistItem.userId = user.id
    wishlistItem.productId = productId
    await wishlistItem.save()

    return response.status(201).json({
      message: 'Product added to wishlist successfully.',
      wishlistItem,
    })
  }

  public async destroy({ auth, params, response }: HttpContextContract) {
    const user = auth.user!
    // eslint-disable-next-line no-debugger
    debugger
    const { productId } = params

    // Check if the product is in the wishlist for the user
    const wishlistItem = await Wishlist.query()
      .where('user_id', user.id)
      .where('product_id', productId)
      .first()

    if (!wishlistItem) {
      return response.status(404).json({
        message: 'Product not found in the wishlist.',
      })
    }

    // If the product is in the wishlist, remove it
    await wishlistItem.delete()

    return response.status(200).json({
      message: 'Product removed from wishlist successfully.',
    })
  }

  public async show({ auth, params, response }: HttpContextContract) {
    const user = auth.user!
    const productId = params.productId
    const item = await Wishlist.query()
      .where('user_id', user.id)
      .where('product_id', productId)
      .first()

    if (!item) {
      return response.status(404).json({ message: 'Product not found in wishlist' })
    }

    return item
  }
}

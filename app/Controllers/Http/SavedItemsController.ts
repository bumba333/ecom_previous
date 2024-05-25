// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Cart from 'App/Models/Cart'
import ProductVariation from 'App/Models/ProductVariation'
import SavedItem from 'App/Models/SavedItem'

export default class SavedItemsController {
  public async store({ request, auth, response }) {
    try {
      // Extract product_id and quantity from the request
      const { productVariationId, quantity } = request.only(['productVariationId', 'quantity'])
      // Get the authenticated user
      const user = auth.user
      // Fetch Cart details
      const cart = await Cart.findByOrFail('user_id', user.id)
      // Check if the item exists in the user's cart
      const itemToDelete = await cart
        .related('items')
        .query()
        .where('product_variation_id', productVariationId)
        .first()

      if (itemToDelete) {
        // If the item exists in the cart, delete it
        await itemToDelete.delete()
        // Check if the cart is empty
        const cartItems = await cart.related('items').query()
        const cartItemCount = cartItems.length

        if (cartItemCount === 0) {
          // If the cart is empty, delete the cart as well
          await cart.delete()
        }
      }

      //Check if the item is already in Saved Item List
      var savedItem = await SavedItem.findBy('product_variation_id', productVariationId)
      if (savedItem) {
        // Update the quantity and save the item
        savedItem.quantity = quantity
      } else {
        // Create a new saved item record
        savedItem = new SavedItem()
        savedItem.userId = user.id
        savedItem.productVariationId = productVariationId
        savedItem.quantity = quantity
      }
      // Save the item to the database
      await savedItem.save()

      const productDetails = await ProductVariation.query()
        .where('id', productVariationId)
        .preload('product')
        .preload('images')
        .preload('inventory')

      // Return a JSON response with the saved item
      return response.status(201).json({ savedItem, productDetails })
    } catch (error) {
      // Handle errors and return a 500 Internal Server Error response
      return response.status(500).json({ error: error })
    }
  }

  //List all saved items for the authenticated user.
  public async index({ auth, response }) {
    try {
      // Get the authenticated user
      const user = auth.user

      // Fetch all saved items for the user
      const savedItems = await SavedItem.query()
        .where('user_id', user.id)
        .preload('productVariation', (q) => {
          q.preload('product').preload('images')
        })

      return response.status(200).json(savedItems)
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  //Update the quantity of a saved item.
  public async update({ params, auth, request, response }) {
    try {
      // Get the authenticated user
      const user = auth.user

      // Extract the new quantity from the request
      const { quantity } = request.only(['quantity'])

      // Find the saved item by ID
      const savedItem = await SavedItem.find(params.id)

      if (!savedItem) {
        return response.status(404).json({ error: 'Saved item not found' })
      }

      // Update the quantity and save the item
      savedItem.quantity = quantity
      await savedItem.save()

      // Fetch Cart details
      const cart = await Cart.findByOrFail('user_id', user.id)
      // Check if the item exists in the user's cart
      const itemToDelete = await cart
        .related('items')
        .query()
        .where('product_variation_id', savedItem.productVariationId)
        .first()

      if (itemToDelete) {
        // If the item exists in the cart, delete it
        await itemToDelete.delete()
        // Check if the cart is empty
        const cartItems = await cart.related('items').query()
        const cartItemCount = cartItems.length

        if (cartItemCount === 0) {
          // If the cart is empty, delete the cart as well
          await cart.delete()
        }
      }

      return response.status(200).json(savedItem)
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  //Delete a saved item.
  public async destroy({ params, response }) {
    try {
      // Find the saved item by ID and delete it
      const savedItem = await SavedItem.find(params.id)

      if (!savedItem) {
        return response.status(404).json({ error: 'Saved item not found' })
      }

      await savedItem.delete()

      return response.status(204).send() // No content on success
    } catch (error) {
      return response.status(500).json({ error: 'Internal server error' })
    }
  }
}

// app/Controllers/Http/OrderController.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Order from 'App/Models/Order'
import Cart from 'App/Models/Cart'
import OrderItem from 'App/Models/OrderItem'
import Wallet from 'App/Models/Wallet'
import puppeteer from 'puppeteer'

export default class OrderController {
  public async store({ request, response, auth }: HttpContextContract) {
    // Get the authenticated user
    const user = auth.user!
    var walletDeducted: boolean = false
    // Fetch the user's cart with cart items
    const cart = await Cart.query()
      .where('user_id', user.id)
      .preload('items', (query) => {
        query.preload('product').preload('productVariation')
      })
      .firstOrFail()

    // eslint-disable-next-line no-debugger
    debugger
    // Calculate the total amount for the order based on cart items and quantities
    let totalAmount = 0
    for (const cartItem of cart.items) {
      totalAmount += cartItem.subtotal
    }
    // Verify wallet balance if using wallet payment
    if (request.input('paymentMethod') === 'wallet') {
      const wallet = await Wallet.query().where('user_id', user.id).first()

      if (!wallet) {
        return response.status(400).json({ message: 'Wallet not found' })
      }

      if (totalAmount > wallet.balance) {
        return response.status(400).json({ message: 'Insufficient wallet balance' })
      }

      // Deduct the order total from the wallet balance
      wallet.balance -= totalAmount
      await wallet.save()
      walletDeducted = true
    }
    // Create a new order
    const order = new Order()
    order.userId = user.id
    if (walletDeducted) {
      order.paymentStatus = 'paid'
    } else {
      order.paymentStatus = 'pending'
    }
    order.totalAmount = totalAmount
    order.couponCode = cart.couponCode!
    order.discountAmount = cart.discountedAmount
    await order.save()

    // Create order items for each cart item and associate them with the order
    for (const cartItem of cart.items) {
      const orderItem = new OrderItem()
      orderItem.orderId = order.id
      orderItem.productId = cartItem.productId
      orderItem.productVariationId = cartItem.productVariationId
      orderItem.quantity = cartItem.quantity
      await orderItem.save()
    }

    // Empty the user's cart
    await cart.delete()

    return response.status(201).json({
      message: 'Order created successfully',
      order,
    })
  }

  /**
   * Retrieve and display the details of a specific order.
   */
  public async getOrderDetails({ params, response }: HttpContextContract) {
    try {
      // Get the order ID from the route parameters
      const orderId = params.id

      // Find the order by ID and ensure it exists
      const order = await Order.query()
        .where('id', orderId)
        .preload('orderItems', (query) => {
          query.preload('product').preload('productVariation', (q) => {
            q.preload('images')
          })
        })
        .firstOrFail()

      return response.status(200).json({
        order,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while retrieving order details',
        error: error.message,
      })
    }
  }

  /**
   * List a user's past orders.
   */
  public async listUserOrders({ auth, response }: HttpContextContract) {
    try {
      // Get the authenticated user
      const user = auth.user!

      // Retrieve the user's orders with order items
      const orders = await Order.query()
        .where('user_id', user.id)
        .preload('orderItems', (query) => {
          query.preload('product').preload('productVariation')
        })
        .orderBy('created_at', 'desc') // Optionally, order by creation date

      return response.status(200).json({ orders })
    } catch (error) {
      return response.status(500).json({
        message: "An error occurred while fetching the user's orders",
        error: error.message,
      })
    }
  }

  /**
   * List all orders for admin.
   */
  public async listAllOrders({ response }: HttpContextContract) {
    try {
      // Retrieve all orders with order items
      const orders = await Order.query()
        .preload('orderItems', (query) => {
          query.preload('product').preload('productVariation')
        })
        .orderBy('created_at', 'desc') // Optionally, order by creation date

      return response.status(200).json({ orders })
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while fetching all orders',
        error: error.message,
      })
    }
  }

  /**
   * Cancel an order.
   */
  public async cancelOrder({ params, response }: HttpContextContract) {
    try {
      // Get the order ID from the route parameters
      const orderId = params.id
      // Find the order by ID and ensure it exists
      const order = await Order.findOrFail(orderId)

      // Check if the order can be canceled (e.g., not already canceled or delivered)
      if (order.paymentStatus === 'pending' || order.paymentStatus === 'paid') {
        // Update the order status to "canceled"
        order.paymentStatus = 'canceled'
        await order.save()

        return response.status(200).json({
          message: 'Order canceled successfully',
        })
      } else {
        return response.status(400).json({
          message: 'The order cannot be canceled at this time.',
        })
      }
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while canceling the order',
        error: error.message,
      })
    }
  }

  /**
   * Filter and retrieve orders based on criteria like date, status, or payment method.
   */
  public async filterOrders({ request, response }: HttpContextContract) {
    try {
      const { startDate, endDate, status, paymentMethod } = request.qs()

      // Create a query builder to fetch orders
      const query = Order.query()

      // Apply filters as needed
      if (startDate && endDate) {
        query.whereBetween('created_at', [startDate, endDate])
      }

      if (status) {
        query.where('status', status)
      }

      if (paymentMethod) {
        query.where('payment_method', paymentMethod)
      }

      // Retrieve the filtered orders
      const filteredOrders = await query.preload('orderItems').exec()

      return response.status(200).json({
        orders: filteredOrders,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while filtering orders',
        error: error.message,
      })
    }
  }

  /**
   * Generate a PDF report of orders using Puppeteer.
   */
  public async generatePdfReport({ response }: HttpContextContract) {
    try {
      // Fetch orders from the database
      const orders = await Order.query().preload('orderItems').exec()

      // Create a new Puppeteer browser instance
      const browser = await puppeteer.launch()
      const page = await browser.newPage()

      // Customize the report content
      let content = '<h1>Order Report</h1>'

      for (const order of orders) {
        content += `<h2>Order ID: ${order.id}</h2>`
        // Add more order details as needed
      }

      // Generate a PDF from the HTML content
      await page.setContent(content)
      const pdf = await page.pdf({ format: 'A4' })

      // Close the Puppeteer browser
      await browser.close()

      // Return the PDF as a response
      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'inline; filename=order_report.pdf')
      return response.send(pdf)
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while generating the PDF report',
        error: error.message,
      })
    }
  }

  /**
   * Update the status of an order.
   */
  public async updateOrderStatus({ params, request, response }: HttpContextContract) {
    try {
      const orderId = params.id
      const { status } = request.only(['status']) // You can pass the new status in the request body

      // Find the order by ID
      const order = await Order.find(orderId)

      if (!order) {
        return response.status(404).json({
          message: 'Order not found',
        })
      }

      // Update the order status
      order.paymentStatus = status // Assuming 'status' is a column in your 'orders' table

      await order.save()

      return response.status(200).json({
        message: 'Order status updated successfully',
        order,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'An error occurred while updating the order status',
        error: error.message,
      })
    }
  }
}

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

import Inventory from 'App/Models/Inventory'
import Product from 'App/Models/Product'
import ProductVariation from 'App/Models/ProductVariation'

export default class InventoriesController {
  /**
   * Get inventory details for a specific product variation.
   * GET /api/inventory/:productId/:variationId
   */
  public async getInventory({ params, response }) {
    try {
      const { productId, variationId } = params

      // Fetch the inventory information for the specified product and variation
      const inventory = await Inventory.query()
        .where('product_id', productId)
        .where('product_variation_id', variationId)
        .firstOrFail()

      return response.status(200).json({ inventory })
    } catch (error) {
      return response.status(404).json({ message: 'Inventory not found' })
    }
  }

  /**
   * Update inventory details for a specific product variation.
   * PUT /api/inventory/:productId/:variationId
   */
  public async updateInventory({ params, request, response }) {
    try {
      const { productId, variationId } = params
      const data = request.only(['stock_quantity', 'low_stock_threshold', 'in_stock', 'total_sold'])

      // Fetch the inventory information for the specified product and variation
      const inventory = await Inventory.query()
        .where('product_id', productId)
        .where('product_variation_id', variationId)
        .firstOrFail()

      // Update inventory fields
      await inventory.merge(data).save()

      return response.status(200).json({ message: 'Inventory updated successfully', inventory })
    } catch (error) {
      return response.status(404).json({ message: 'Inventory not found' })
    }
  }

  // Other methods such as adding new inventory, listing all inventory, etc., can be added here.
  /**
   * Add new inventory for a specific product variation.
   * POST /api/inventory
   */
  public async addInventory({ request, response }) {
    try {
      const data = request.only([
        'product_id',
        'product_variation_id',
        'stock_quantity',
        'low_stock_threshold',
        'in_stock',
      ])
      // Check if the product and variation exist
      const product = await Product.find(data.product_id)
      const variation = await ProductVariation.find(data.product_variation_id)

      if (!product || !variation) {
        return response.status(404).json({ message: 'Product or variation not found' })
      }

      // Create a new inventory record
      const inventory = new Inventory()
      inventory.fill(data)
      await inventory.save()

      return response.status(201).json({ message: 'Inventory added successfully', inventory })
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error', error })
    }
  }

  /**
   * List all inventory records.
   * GET /api/inventory
   */
  public async listInventory({ response }) {
    try {
      const inventoryList = await Inventory.all()

      return response.status(200).json({ inventoryList })
    } catch (error) {
      return response.status(500).json({ message: 'Internal server error' })
    }
  }

  /**
   * Generate an inventory report.
   * This report includes insights into inventory levels, sales trends, and product performance.
   */
  public async generateInventoryReport({ response }: HttpContextContract) {
    try {
      // Get all inventory records
      const inventoryRecords = await Inventory.query()
        .preload('product')
        .preload('variation')
        .orderBy('created_at', 'desc')
        .limit(100) // Limit the number of records in the report, adjust as needed

      // Calculate total inventory value
      let totalInventoryValue = 0
      for (const record of inventoryRecords) {
        totalInventoryValue += record.stockQuantity * record.variation.price
      }

      // Find top-selling products
      /* const topSellingProducts = await ProductVariation.query()
        .select('product_id')
        .sum('total_sold as totalSold')
        .groupBy('product_id')
        .orderBy('totalSold', 'desc')
        .limit(10) // Adjust the limit as needed */
      const topSellingProducts = await Inventory.query()
        .select('product_id') // Change to 'product_id' if that's the correct column name in your table
        .select(Database.raw('SUM(total_sold) as totalSold'))
        .groupBy('product_id')
        .orderBy('totalSold', 'desc')
        .limit(10)

      // Prepare the report data
      const reportData = {
        totalInventoryValue,
        inventoryRecords,
        topSellingProducts,
      }

      // Return the report as JSON response
      return response.status(200).json({
        message: 'Inventory report generated successfully',
        report: reportData,
      })
    } catch (error) {
      console.error('Error generating inventory report:', error)
      return response.status(500).json({
        message: 'An error occurred while generating the inventory report.',
        error: error.message,
      })
    }
  }
}

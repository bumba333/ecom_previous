import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Inventory from 'App/Models/Inventory'
import ProductVariation from 'App/Models/ProductVariation'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    // Iterate through product variations and insert initial inventory records for each
    for (let variationId = 1; variationId <= 50; variationId++) {
      const productVariation = await ProductVariation.find(variationId)

      if (productVariation) {
        // Create inventory data for each product variation
        const inventoryData = {
          product_variation_id: productVariation.id,
          stock_quantity: 100, // Initial stock quantity
          low_stock_threshold: 10, // Adjust as needed
          in_stock: true, // Product is in stock initially
          totalSold: 0, // No items sold initially
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        }

        // Check if an inventory record already exists for this variation
        const existingInventory = await Inventory.query()
          .where('product_variation_id', productVariation.id)
          .first()

        if (!existingInventory) {
          // Create a new inventory record
          await Inventory.create(inventoryData)
          /* console.log(`Inventory seed created for Product Variation ID ${productVariation.id}`) */
        } else {
          /* console.log(
            `Inventory record already exists for Product Variation ID ${productVariation.id}. Skipping inventory seed for this variation.`
          ) */
        }
      }
    }
  }
}

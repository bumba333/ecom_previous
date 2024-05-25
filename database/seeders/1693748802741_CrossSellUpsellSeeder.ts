import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Product from 'App/Models/Product'

export default class extends BaseSeeder {
  public async run() {
    // Loop through 10 products
    for (let productId = 1; productId <= 10; productId++) {
      const product = await Product.find(productId)

      if (product) {
        // Attach 2 cross-sell products if they exist
        const crossSellIds = [(productId % 10) + 1, ((productId + 1) % 10) + 1].filter(
          (id) => id !== productId
        )

        // Ensure the crossSellIds exist in the products table
        const existingCrossSellProducts = await Product.query().whereIn('id', crossSellIds).exec()

        if (existingCrossSellProducts.length === crossSellIds.length) {
          await product.related('crossSell').attach(crossSellIds)
        } else {
          console.log(
            `Skipping cross-sell attachment for Product ID ${productId}. Some cross-sell products do not exist.`
          )
        }

        // Attach 2 upsell products if they exist
        const upSellIds = [((productId + 2) % 10) + 1, ((productId + 3) % 10) + 1].filter(
          (id) => id !== productId
        )

        // Ensure the upSellIds exist in the products table
        const existingUpSellProducts = await Product.query().whereIn('id', upSellIds).exec()

        if (existingUpSellProducts.length === upSellIds.length) {
          await product.related('upSell').attach(upSellIds)
        } else {
          console.log(
            `Skipping up-sell attachment for Product ID ${productId}. Some up-sell products do not exist.`
          )
        }
      }
    }
  }
}

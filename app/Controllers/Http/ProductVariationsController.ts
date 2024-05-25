import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product'
import ProductVariation from 'App/Models/ProductVariation'

export default class ProductVariationController {
  public async create({ request, params }: HttpContextContract) {
    const productId = params.productId

    // Fetch the product
    const product = await Product.query().where('id', productId).firstOrFail()

    // Get the variation details from the request
    const { size, color, price, salePrice } = request.only(['size', 'color', 'price', 'salePrice'])

    // Create the variation
    const variation = new ProductVariation()
    variation.productId = product.id
    variation.size = size
    variation.color = color
    variation.price = price
    variation.salePrice = salePrice
    await variation.save()

    return variation
  }

  // update variation
  public async update({ request, params }: HttpContextContract) {
    const variationId = params.variationId

    // Fetch the variation
    const variation = await ProductVariation.query().where('id', variationId).firstOrFail()

    // Get the variation details from the request
    const { size, color, price, salePrice } = request.only(['size', 'color', 'price', 'salePrice'])

    // Update the variation details
    await variation.merge({ size, color, price, salePrice }).save()

    return variation
  }

  public async delete({ params }: HttpContextContract) {
    const variationId = params.variationId

    // Fetch the variation
    const variation = await ProductVariation.query().where('id', variationId).firstOrFail()

    // Delete the variation
    await variation.delete()

    return { message: 'Variation deleted successfully' }
  }
}

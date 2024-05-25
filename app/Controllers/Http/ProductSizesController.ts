import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SizeType from 'App/Models/SizeType'
import ProductSize from 'App/Models/ProductSize'

export default class ProductSizesController {
  // SizeType CRUD operations

  public async indexSizeType() {
    return await SizeType.all()
  }

  public async storeSizeType({ request, response }: HttpContextContract) {
    try {
      const { name, sizes } = request.only(['name', 'sizes'])

      // Validate the incoming data
      if (!name || !sizes || !Array.isArray(sizes) || sizes.length === 0) {
        return response.badRequest({ message: 'Invalid request data' })
      }

      // Create the size type
      const sizeType = await SizeType.create({ name })

      // Create sizes for the size type
      const createdSizes = await Promise.all(
        sizes.map((size: string) => {
          return ProductSize.create({ size, sizeTypeId: sizeType.id })
        })
      )

      return response.created({
        message: 'SizeType and sizes created successfully',
        sizeType,
        createdSizes,
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to create size type and sizes',
        error: error.message,
      })
    }
  }

  public async showSizeType({ params, response }: HttpContextContract) {
    const sizeType = await SizeType.find(params.id)
    if (!sizeType) {
      response.notFound({ message: 'SizeType not found' })
    }
    return sizeType
  }

  public async updateSizeType({ request, params }: HttpContextContract) {
    const data = request.only(['name', 'sizes'])
    const sizeType = await SizeType.findOrFail(params.id)
    await sizeType.merge(data).save()
    return sizeType
  }

  public async destroySizeType({ params }: HttpContextContract) {
    const sizeType = await SizeType.findOrFail(params.id)
    await sizeType.delete()
    return { message: 'SizeType deleted successfully' }
  }

  // ProductSize CRUD operations

  public async indexProductSize() {
    return await ProductSize.all()
  }

  public async storeProductSize({ request }: HttpContextContract) {
    const data = request.only(['size', 'size_type_id'])
    const productSize = await ProductSize.create(data)
    return productSize
  }

  public async showProductSize({ params, response }: HttpContextContract) {
    const productSize = await ProductSize.find(params.id)
    if (!productSize) {
      response.notFound({ message: 'ProductSize not found' })
    }
    return productSize
  }

  public async updateProductSize({ request, params }: HttpContextContract) {
    const data = request.only(['size', 'size_type_id'])
    const productSize = await ProductSize.findOrFail(params.id)
    await productSize.merge(data).save()
    return productSize
  }

  public async destroyProductSize({ params }: HttpContextContract) {
    const productSize = await ProductSize.findOrFail(params.id)
    await productSize.delete()
    return { message: 'ProductSize deleted successfully' }
  }
}

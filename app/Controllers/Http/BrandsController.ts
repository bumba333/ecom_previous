import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Brand from 'App/Models/Brand'

export default class BrandsController {
  public async store({ request, response }: HttpContextContract) {
    const { name, slug } = request.only(['name', 'slug'])
    //const logo = request.files('logo', { size: '100kb' })

    const brand = new Brand()
    brand.name = name
    brand.slug = slug
    brand.logo = 'temp'
    await brand.save()

    return response.status(201).json({
      message: 'Brand created successfully',
      brand,
    })
  }

  public async index({ response }: HttpContextContract) {
    const brands = await Brand.all()

    return response.status(200).json({
      message: 'List of brands',
      brands,
    })
  }

  public async update({ params, request, response }: HttpContextContract) {
    const brand = await Brand.findOrFail(params.id)

    const { name, slug, logo } = request.only(['name', 'slug', 'logo'])

    brand.name = name
    brand.slug = slug
    brand.logo = logo

    await brand.save()

    return response.status(200).json({
      message: 'Brand updated successfully',
      brand,
    })
  }

  public async destroy({ params, response }: HttpContextContract) {
    const brand = await Brand.findOrFail(params.id)

    await brand.delete()

    return response.status(200).json({
      message: 'Brand deleted successfully',
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const brand = await Brand.findOrFail(params.id)

    return response.status(200).json({
      message: 'Brand found',
      brand,
    })
  }
}

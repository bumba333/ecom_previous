// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Product from 'App/Models/Product'
import Tag from 'App/Models/Tag'

export default class TagsController {
  public async index({ response }) {
    const tags = await Tag.all()
    return response.status(200).json(tags)
  }

  public async store({ request, response }) {
    const data = request.only(['name', 'description'])

    const tag = await Tag.create(data)

    return response.status(201).json(tag)
  }

  public async show({ params, response }) {
    const tag = await Tag.query()
      .where('id', params.id)
      .preload('products') // Preload the 'products' relationship
      .firstOrFail()
    await tag.load('images') // Preload the 'tag_images' relationship
    return response.status(200).json(tag)
  }

  public async update({ params, request, response }) {
    const tag = await Tag.findOrFail(params.id)

    const { name } = request.only(['name'])
    tag.name = name
    await tag.save()

    return response.status(200).json(tag)
  }

  public async destroy({ params, response }) {
    try {
      const tag = await Tag.findOrFail(params.id)
      if (!tag) {
        return response.status(404).json({
          status: 'failure',
          message: 'Tag with specified id does not exist',
        })
      }
      await tag.delete()

      return response.status(200).json({
        status: 'success',
        message: 'Tag deleted successfully',
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure',
        message: 'An error occurred',
        error: e,
      })
    }
  }

  //ATTACH TAGS WITH PRODUCT
  public async attachTags({ request, response }) {
    const { productId, tagIds } = request.only(['productId', 'tagIds'])

    const product = await Product.find(productId)

    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }

    await product.related('tags').attach(tagIds)

    return response.status(200).json({ message: 'Tags attached successfully' })
  }

  //DETACH TAGS FROM PRODUCT
  public async detachTags({ request, response }) {
    const { productId, tagIds } = request.only(['productId', 'tagIds'])

    const product = await Product.find(productId)

    if (!product) {
      return response.status(404).json({ message: 'Product not found' })
    }

    // Use the detach method to remove the specified tagIds from the product
    await product.related('tags').detach(tagIds)

    return response.status(200).json({ message: 'Tags detached successfully' })
  }
}

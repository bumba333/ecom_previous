import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Subscriber from 'App/Models/Subscriber'

export default class SubscribersController {
  public async subscribe({ request, response }) {
    try {
      const { email } = request.only(['email'])
      const existingSubscriber = await Subscriber.query().where('email', email).first()

      if (existingSubscriber) {
        return response.status(400).json({ message: 'Subscriber already exists' })
      }

      const subscriber = new Subscriber()
      subscriber.email = email
      await subscriber.save()

      return response.status(201).json({ message: 'Subscriber added successfully' })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'An error occurred while subscribing', error: error.message })
    }
  }

  public async unsubscribe({ request, response }: HttpContextContract) {
    try {
      const { email } = request.only(['email'])
      const subscriber = await Subscriber.query().where('email', email).first()

      if (!subscriber) {
        return response.status(400).json({ message: 'Subscriber not found' })
      }

      await subscriber.delete()

      return response.status(200).json({ message: 'Subscriber unsubscribed successfully' })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'An error occurred while unsubscribing', error: error.message })
    }
  }

  public async listSubscribers({ response }: HttpContextContract) {
    try {
      const subscribers = await Subscriber.all()

      return response.status(200).json(subscribers)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'An error occurred while fetching subscribers', error: error.message })
    }
  }

  public async getSubscriber({ params, response }: HttpContextContract) {
    try {
      const { idOrEmail } = params
      const subscriber = await Subscriber.query()
        .where('id', idOrEmail)
        .orWhere('email', idOrEmail)
        .first()

      if (!subscriber) {
        return response.status(404).json({ message: 'Subscriber not found' })
      }

      return response.status(200).json(subscriber)
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'An error occurred while fetching the subscriber', error: error.message })
    }
  }

  public async updateSubscriber({ params, request, response }: HttpContextContract) {
    try {
      const { id } = params
      const subscriber = await Subscriber.findOrFail(id)

      if (!subscriber) {
        return response.status(404).json({ message: 'Subscriber not found' })
      }

      const { email } = request.only(['email'])
      subscriber.email = email
      await subscriber.save()

      return response.status(200).json({ message: 'Subscriber updated successfully', subscriber })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'An error occurred while updating the subscriber', error: error.message })
    }
  }
}

// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Address from 'App/Models/Address'

export default class AddressesController {
  // Create a new address for the authenticated user
  public async create({ auth, request }) {
    const user = auth.user
    const data = request.only([
      'address1',
      'address1',
      'city',
      'state',
      'postalCode',
      'addressType',
    ])
    // eslint-disable-next-line no-debugger
    debugger
    const address = new Address()
    address.fill({ ...data, user_id: user.id })
    await address.save()

    return address
  }

  // Update an existing address
  public async update({ params, request }) {
    const addressId = params.id
    const data = request.only([
      'address1',
      'address1',
      'city',
      'state',
      'postalCode',
      'addressType',
    ])

    const address = await Address.findOrFail(addressId)
    address.merge(data)
    await address.save()

    return address
  }

  // List all addresses of the authenticated user
  public async index({ auth }) {
    const user = auth.user
    const addresses = await Address.query().where('userId', user.id)

    return addresses
  }

  // Delete an address
  public async destroy({ params }) {
    const addressId = params.id
    const address = await Address.findOrFail(addressId)
    await address.delete()

    return { message: 'Address deleted successfully' }
  }
}

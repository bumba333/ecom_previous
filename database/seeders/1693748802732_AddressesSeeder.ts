import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Address from 'App/Models/Address'

export default class AddressSeeder extends BaseSeeder {
  public async run() {
    // Fetch all users
    const users = await User.all()

    // Define addresses data
    const addressesData = [
      {
        address1: '123 Main St',
        address2: 'Buckinghum',
        city: 'Cityville',
        state: 'Delhi',
        postalCode: '123456',
        addressType: 'Home',
      },
      {
        address1: '456 Elm St',
        address2: 'River Side',
        city: 'Townsville',
        state: 'Delhi',
        postalCode: '543216',
        addressType: 'Work',
      },
    ]

    // Create addresses for each user
    for (const user of users) {
      for (const addressData of addressesData) {
        await Address.create({
          userId: user.id,
          ...addressData,
        })
      }
    }
  }
}

import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Coupon from 'App/Models/Coupon'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  public async run() {
    // Generate 10 mock coupons
    const couponsData = [
      {
        code: 'SUMMER25',
        discountType: 'percentage',
        discountValue: 25,
        usageLimit: 100,
        isForSpecificUser: true, // Set the user ID if applicable
        minOrderAmount: 50,
        expiresAt: DateTime.now().plus({ days: 30 }),
      },
      {
        code: 'SAVE10NOW',
        discountType: 'fixed',
        discountValue: 10,
        usageLimit: 50,
        isForSpecificUser: false,
        minOrderAmount: 30,
        expiresAt: DateTime.now().plus({ days: 60 }),
      },
      // Add more coupons...
    ]

    // Create coupons in the database
    await Coupon.createMany(couponsData)
  }
}

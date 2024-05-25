import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Wallet from 'App/Models/Wallet'

export default class extends BaseSeeder {
  public async run() {
    // Fetch all users
    const users = await User.all()

    // Use a database transaction for creating wallets
    await Database.transaction(async (trx) => {
      for (const user of users) {
        // Check if the user already has a wallet
        const existingWallet = await Wallet.query().where('user_id', user.id).first()

        if (!existingWallet) {
          // Create a wallet for the user
          await Wallet.create(
            {
              userId: user.id,
              balance: 20000, // Initial balance
              currency: 'INR', // You can set the default currency here
              status: 'active', // Set the default status
            },
            trx
          )
          console.log('Wallet for Username ' + user.first_name + ' created')
        }
      }
    })
  }
}

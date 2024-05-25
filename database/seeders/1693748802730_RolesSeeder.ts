import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await Role.create({ name: 'admin' })
    await Role.create({ name: 'customer' })
    await Role.create({ name: 'vendor' })
    await Role.create({ name: 'marketing-agents' })
    await Role.create({ name: 'delivery-agents' })
    // Add more roles...
  }
}

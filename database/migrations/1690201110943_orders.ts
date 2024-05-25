import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      // Other fields for the order (e.g., totalAmount, status, etc.)
      table.enum('payment_status', ['pending', 'paid', 'canceled'])
      table.decimal('total_amount').notNullable()
      table.string('coupon_code').nullable()
      table.decimal('discount_amount')
      table.string('delivery_status')
      table.timestamps(true, true)
    })

    /**
     * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
     */
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

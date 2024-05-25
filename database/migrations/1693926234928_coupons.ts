import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'coupons'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 50).notNullable().unique()
      table.enum('discount_type', ['fixed', 'percentage']).notNullable()
      table.decimal('discount_value', 10, 2).notNullable()
      table.boolean('is_for_specific_user').notNullable()
      table.timestamp('expires_at').nullable()
      table.integer('usage_limit').nullable()
      table.integer('used_count').nullable().defaultTo(0)
      table.decimal('min_order_amount', 10, 2).nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

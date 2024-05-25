import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'product_variations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table.string('size').notNullable()
      table.string('color').notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.enu('status', ['in stock', 'out of stock', 'pre-order']).defaultTo('in stock')
      table.decimal('sale_price', 10, 2).nullable()

      // Add other fields for the variation if needed

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

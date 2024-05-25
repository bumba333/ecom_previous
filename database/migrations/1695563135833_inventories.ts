import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'inventories'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('product_id')
        .unsigned()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE')
      table
        .integer('product_variation_id')
        .unsigned()
        .references('id')
        .inTable('product_variations')
        .onDelete('CASCADE')
      table.integer('stock_quantity').notNullable()
      table.integer('low_stock_threshold').notNullable()
      table.boolean('in_stock').defaultTo(true)
      table.integer('total_sold').defaultTo(0) // Default to 0 for new records
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

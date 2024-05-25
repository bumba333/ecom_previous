import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CartItems extends BaseSchema {
  protected tableName = 'cart_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('cart_id').unsigned().references('carts.id').onDelete('CASCADE')
      table.integer('product_id').unsigned().references('products.id').onDelete('CASCADE')
      table
        .integer('product_variation_id')
        .unsigned()
        .references('id')
        .inTable('product_variations')
      table.integer('quantity').notNullable()
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

// database/migrations/<timestamp>_create_images_table.ts

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateImagesTable extends BaseSchema {
  protected tableName = 'images'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      /* table.integer('product_id').unsigned().notNullable() */
      /* this.schema.alterTable(this.tableName, (table) => {
        table
          .integer('product_id')
          .unsigned()
          .references('id')
          .inTable('products')
          .onDelete('CASCADE')
      }) */
      /* table.foreign('product_id').references('id').inTable('products').onDelete('cascade') */
      table
        .integer('product_variation_id')
        .unsigned()
        .references('id')
        .inTable('product_variations')
        .onDelete('CASCADE')
      table.string('url').notNullable() // Assuming you store the image URL here
      table.string('file_name')
      table.text('description')
      table.boolean('featured')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

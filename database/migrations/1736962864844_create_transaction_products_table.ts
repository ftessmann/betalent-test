import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transaction_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('transaction_id')
        .unsigned()
        .references('id')
        .inTable('transactions')
        .notNullable()
      table.integer('products_id').unsigned().references('id').inTable('products').notNullable()
      table.integer('quantity').unsigned().notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

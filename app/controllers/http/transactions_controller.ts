import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { transactionValidator } from '#validators/transaction_validator'
import TransactionProduct from '#models/transaction_product'

type TransactionStatus = 'pending' | 'completed' | 'failed'
type TransactionPayload = {
  client_id: number
  gateway_id: number
  external_id?: string
  status: TransactionStatus
  amount: number
  card_last_numbers?: string
  products: Array<{
    product_id: number
    quantity: number
  }>
}

export default class TransactionController {
  async store({ request }: HttpContext) {
    const payload = (await transactionValidator.validate(request.all())) as TransactionPayload

    const transaction = await Transaction.create({
      clientId: payload.client_id,
      gatewayId: payload.gateway_id,
      externalId: payload.external_id,
      status: payload.status as TransactionStatus,
      amount: payload.amount,
      cardLastNumbers: payload.card_last_numbers,
    })

    if (payload.products && payload.products.length > 0) {
      const transactionProducts = payload.products.map((product) => ({
        transactionId: transaction.id,
        productId: product.product_id,
        quantity: product.quantity,
      }))

      await TransactionProduct.createMany(transactionProducts)
    }

    await transaction.refresh()
    await transaction.load('client')
    await transaction.load('gateway')
    await transaction.load('transactionProducts')

    return transaction
  }

  async update({ params, request }: HttpContext) {
    const transaction = await Transaction.findOrFail(params.id)
    const payload = (await transactionValidator.validate(request.all())) as TransactionPayload

    await transaction
      .merge({
        status: payload.status as TransactionStatus,
        gatewayId: payload.gateway_id,
        externalId: payload.external_id,
      })
      .save()

    await transaction.load('client')
    await transaction.load('gateway')
    await transaction.load('transactionProducts')

    return transaction
  }

  // ... rest of the controller methods remain the same
}

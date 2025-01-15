import vine from '@vinejs/vine'

export const transactionProductValidator = vine.compile(
  vine.object({
    transaction_id: vine.number().withoutDecimals(),
    product_id: vine.number().withoutDecimals(),
    quntity: vine.number().withoutDecimals().positive(),
  })
)

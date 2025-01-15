import type { HttpContext } from '@adonisjs/core/http'
import OrderService from '#services/order/order_service'

export default class OrderController {
  private orderService: OrderService

  constructor() {
    this.orderService = new OrderService()
  }

  public async store({ request }: HttpContext) {
    try {
      const payload = request.all()

      const result = await this.orderService.createOrder({
        name: payload.name,
        email: payload.email,
        amount: payload.amount,
        card_number: payload.card_number,
        cvv: payload.cvv,
      })

      return result
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }
}

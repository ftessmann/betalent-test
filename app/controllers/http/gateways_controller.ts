import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'
import { gatewayValidator } from '#validators/gateway_validator'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

type GatewayPayload = {
  name: string
  is_active: boolean
}

export default class GatewayController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const gateways: ModelPaginatorContract<Gateway> = await Gateway.query().paginate(page, limit)

    return gateways
  }

  async store({ request }: HttpContext) {
    const payload = (await gatewayValidator.validate(request.all())) as GatewayPayload

    const gateway = await Gateway.create(payload)
    await gateway.refresh()

    return gateway
  }

  async show({ params }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    return gateway
  }

  async update({ params, request }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    const payload = (await gatewayValidator.validate(request.all())) as GatewayPayload

    await gateway.merge(payload).save()
    return gateway
  }

  async destroy({ params }: HttpContext) {
    const gateway = await Gateway.findOrFail(params.id)
    await gateway.delete()

    return { message: 'Gateway deleted successfully' }
  }
}

import axios from 'axios'
import BaseGatewayService from './base_gateway_service.js'
import { GatewayResponse, GatewayTransaction } from './base_gateway_service.js'

export default class Gateway1Service extends BaseGatewayService {
  private authToken: string | null = null

  constructor() {
    super('http://localhost:3001')
  }

  private async login(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        email: 'dev@betalent.tech',
        token: 'FEC9BB078BF338F464F96B48089EB498',
      })

      this.authToken = response.data.token
    } catch (error) {
      throw new Error('Auth failed @ gateway 1')
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    if (!this.authToken) {
      await this.login()
    }
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    }
  }

  public async processPayment(transaction: GatewayTransaction): Promise<GatewayResponse> {
    try {
      const headers = await this.getHeaders()
      // Transform the data to match Gateway1's expected format
      console.log('Gateway1 Headers:', headers)
      console.log('Gateway1 Payload:', transaction)
      const payload = {
        amount: transaction.valor,
        name: transaction.nome,
        email: transaction.email,
        cardNumber: transaction.numeroCartao,
        cvv: transaction.cvv,
      }

      const response = await axios.post(`${this.baseUrl}/transactions`, payload, { headers })
      console.log('Gateway1 Raw Response:', response.data)

      return {
        success: true,
        transactionId: response.data.id,
      }
    } catch (error) {
      console.error('Gateway1 Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      if (error.response?.status === 401) {
        this.authToken = null
        return this.processPayment(transaction)
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Gateway 1 error',
      }
    }
  }

  public async processRefund(transactionId: string): Promise<GatewayResponse> {
    try {
      const headers = await this.getHeaders()
      await axios.post(
        `${this.baseUrl}/transactions/${transactionId}/charge-back`,
        { id: transactionId },
        { headers }
      )
      return { success: true }
    } catch (error) {
      if (error.response?.status === 401) {
        this.authToken = null
        return this.processRefund(transactionId)
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Refund failed',
      }
    }
  }

  public async getTransactions(): Promise<any> {
    try {
      const headers = await this.getHeaders()
      const response = await axios.get(`${this.baseUrl}/transactions`, { headers })
      return response.data
    } catch (error) {
      return new Error('Failed to fetch transactions from gateway 1')
    }
  }
}

/*
import axios from 'axios'
import BaseGatewayService, { GatewayTransaction, GatewayResponse } from './base_gateway_service.js'
import { CreateTransactionData } from '#types/index'
import Transaction from '#models/transaction'
import Gateway from '#models/gateway'
import Gateway2Service from './gateway2_service.js'

export default class Gateway1Service extends BaseGatewayService {
  private authToken: string | null = null
  constructor() {
    super('http://localhost:3001')
  }

  private async getActiveGateways() {
    const gateways = await Gateway.query().where('isActive', true).orderBy('priority', 'asc')

    return gateways.map((gateway) => ({
      id: gateway.id,
      service: gateway.name === 'gateway1' ? new Gateway1Service() : new Gateway2Service(),
    }))
  }

  private async login(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/login`, {
        email: 'dev@betalent.tech',
        token: 'FEC9BB078BF338F464F96B48089EB498',
      })

      this.authToken = response.data.token
    } catch (error) {
      throw new Error('Auth failed @ gateway 1')
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    if (!this.authToken) {
      await this.login()
    }
    return {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    }
  }

  public async processPayment(transaction: Transaction, paymentData: GatewayTransaction) {
    const activeGateways = await this.getActiveGateways()

    for (const gateway of activeGateways) {
      try {
        const response = await gateway.service.processPayment(paymentData) // Access service first

        if (response.success) {
          await transaction
            .merge({
              gateway_id: gateway.id,
              external_id: response.transactionId,
              status: 'completed',
            } as CreateTransactionData)
            .save()

          return { success: true, transaction }
        }
      } catch (error) {
        console.error(`Gateway ${gateway.id} error:`, error)
        continue
      }
    }

    await transaction
      .merge({
        status: 'failed',
      } as CreateTransactionData)
      .save()

    throw new Error('Payment processing failed on all gateways')
  }
  /*
  public async processPayment(transaction: GatewayTransaction): Promise<GatewayResponse> {
    try {
      const headers = await this.getHeaders()
      const response = await axios.post(`${this.baseUrl}/transactions`, transaction, { headers })
      return { success: true, transactionId: response.data.id }
    } catch (error) {
      if (error.response?.status === 401) {
        this.authToken = null
        return this.processPayment(transaction)
      }

      return { success: false, error: error.response?.data?.message || 'Gateway 1 error' }
    }
  }
    */
/*
  public async processRefund(transactionId: string): Promise<GatewayResponse> {
    try {
      const headers = await this.getHeaders()
      await axios.post(
        `${this.baseUrl}/transactions/${transactionId}/charge-back`,
        { id: transactionId },
        { headers }
      )
      return { success: true }
    } catch (error) {
      if (error.response?.status === 401) {
        this.authToken = null
        return this.processRefund(transactionId)
      }
      return { success: false, error: error.response?.data?.message || 'Refund failed' }
    }
  }

  public async getTransactions(): Promise<any> {
    try {
      const headers = await this.getHeaders()
      const response = await axios.get(`${this.baseUrl}/transactions`, headers)
      return response.data
    } catch (error) {
      return new Error('Failed to fetch transactions from gateway 1')
    }
  }
}
*/

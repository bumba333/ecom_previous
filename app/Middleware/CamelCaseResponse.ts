import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CamelCaseResponseMiddleware {
  public async handle({ response }: HttpContextContract, next: () => Promise<void>) {
    // Call the next middleware to continue the request
    await next()

    // Transform the response JSON to camelCase
    if (response.lazyBody) {
      response.lazyBody = this.transformKeysToCamelCase(response.lazyBody.values())
    }
  }

  private transformKeysToCamelCase(data: any): any {
    if (Array.isArray(data)) {
      return data.map(this.transformKeysToCamelCase)
    } else if (typeof data === 'object') {
      const newData = {}
      for (const key of Object.keys(data)) {
        const newKey = key.replace(/_./g, (match) => match.charAt(1).toUpperCase())
        newData[newKey] = this.transformKeysToCamelCase(data[key])
      }
      return newData
    }
    return data
  }
}

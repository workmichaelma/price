import { map } from 'lodash'
import { getProduct } from '../lib/product'

module.exports = {
  Query: {
    product: async (obj, args, context, info) => {
      if (obj) return obj
      return getProduct(args)
    },
    products: async (obj, args, context, info) => {
      return getProduct(args)
    }
  },
  Product: {
    shops: async (obj, args, context, info) => {
      return map(obj.shops, (records, shop) => {
        return {
          name: shop,
          records
        }
      })
    }
  }
}

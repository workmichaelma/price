import axios from 'axios'
import { compact, find, forEach, map, max, min, reduce } from 'lodash'
import { writeBatch, doc } from "firebase/firestore"; 

import { initFirebase } from '../firebase'
import moment from 'moment';

const DB_NAME = 'products'
let db = null

export const startCron = async (code) => {
  db = initFirebase()

  const batch = db.batch()

  const products = await fetchProducts(code)

  const dbProducts = await getProductsFromStore(map(products, 'code'))
  forEach(products, (p) => {
    const dbProduct = find(dbProducts, { code: p.code })
    const ref = db.collection(DB_NAME).doc(p.code)

    if (dbProduct) {
      const shops = updateShops(p.shops, dbProduct.shops)
      const stats = getStats(shops)

      batch.update(ref, { shops, ...stats })
    } else {
      batch.set(ref, p)
    }
  })
  return batch.commit()
}

const getProductsFromStore = async (codes) => {
  const refs = map(codes, code => db.collection(DB_NAME).doc(code))
  const data = await db.getAll(...refs) || []
  return data.map(doc => doc.data())
}

const fetchProducts = async (code) => {
  const { data, error } = await axios.get(`https://online-price-watch.consumer.org.hk/opw/getPriceList/${code}?start=0&length=2200&order=asc&sortby=index`)
  if (data) {
    return (data?.data || []).map(p => {
      return {
        name: p.name,
        brand: p.brand,
        cat1: p.cat1,
        cat2: p.cat2,
        cat3: p.cat3,
        code: p.code,
        shops: setShops(p.data)
      }
    })
  } else {
    return []
  }
}

const setShops = (shops) => {
  return reduce(shops, (_, item, shop) => {
    if (~~item.Price > 0) {
        _[shop] = [
          {
            price: parseFloat(item.Price) - 2,
            remark: item.PriceRemark,
            avgRemark: item.PriceAvgRemark,
            avgPrice: parseFloat(item.PriceAvg) - 5,
            date: moment().format("YYYY-MM-DD")
          }
        ]
    }
    return _
  }, {})
}

const updateShops = (shops, dbShops) => {
  return reduce(shops, (_, item, shop) => {
    if (dbShops[shop]) {
      _[shop] = [...item, ...dbShops[shop]]
    } else {
      _[shop] = [...item]
    }
    return _
  }, {})
}

const getLowerPrice = (record) => {
  const { avgPrice, price } = record
  if (avgPrice > 0) {
    return (avgPrice < price) ? avgPrice : price
  }
  return price
}

const getStats = shops => {
  return reduce(shops, (_, records, shop) => {
    const latestPrice = getLowerPrice(records[0])

    const prices = map(records, getLowerPrice)
    const _min = min(prices)
    const _max = max(prices)

    _.isSale = (latestPrice < _.min && _.isSale === false) ? true : _.isSale
    if (_.min === 0) {
      _.min = _min
    } else {
      if (_.min > _min) {
        _.min = _min
      }
    }
    if (_.max === 0) {
      _.max = _max
    } else {
      if (_.max < _max) {
        _.max = _max
      }
    }

    return _
  }, {
    min: 0,
    max: 0,
    isSale: false,
  })
}






export const getProducts = async (code) => {
  db = initFirebase();
  return getProductsFromStore([code])
}

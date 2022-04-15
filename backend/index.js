import Koa from 'koa'
import iconv from 'iconv-lite'
import Router from 'koa-router';
import axios from 'axios'

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  const { data, error } = await axios.get(`https://online-price-watch.consumer.org.hk/opw/getPriceList/027?start=0&length=2200&order=asc&sortby=index`)
  if (data) {
    const products = (data?.data || []).map(p => {
      return {
        name: p.name,
        brand: p.brand,
        cat1: p.cat1,
        cat2: p.cat2,
        cat3: p.cat3,
        code: p.code,
        shops: p.data
      }
    })
    
    ctx.body = products
  } else {
    ctx.body = {}

  }
})


app.use(router.routes());

const PORT = 3000

app.listen(PORT, () => console.log(`BACKEND is running at ${PORT}`));

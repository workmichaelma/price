import Koa from 'koa'
import iconv from 'iconv-lite'
import Router from 'koa-router';
import moment from 'moment'
import { CronJob } from 'cron'

import { startCron, getProducts } from './cronjob/fetcher'

const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  try {
    ctx.body = await startCron('027')
  } catch (err) {
    console.log(err)
    ctx.body = []
  }
})

router.get('/products', async (ctx) => {
  const { code } = ctx.request.query
  try {
    ctx.body = await getProducts(code)
  } catch (err) {
    console.log(err)
    ctx.body = []
  }
})


// const scheduleJob = new CronJob("* * * * * *", async () => {
//   console.log("CRONJOB RUNNING - SCHEDULE - " + moment().format());
//   const products = await fetchProducts('027')
//   console.log({products})
// });
// scheduleJob.start();

app.use(router.routes());

const PORT = 3000

app.listen(PORT, () => console.log(`BACKEND is running at ${PORT}`));

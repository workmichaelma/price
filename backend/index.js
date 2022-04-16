import Koa from 'koa'
import iconv from 'iconv-lite'
import series from 'async/series'
import Router from 'koa-router';
// import mount from 'koa-mount';
import { graphqlHTTP } from 'koa-graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { map } from 'lodash';
import moment from 'moment'
import { CronJob } from 'cron'

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
import { startCron, getProducts } from './cronjob/fetcher'

const isDev = process.env.isDev
const app = new Koa();
const router = new Router();

router.get('/', async (ctx) => {
  try {
    console.log("CRONJOB RUNNING - SCHEDULE - " + moment().format());
    const ids = ["001", "004", "009", "015", "018", "027", "037", "040", "045", "046"]
    const jobs = map(ids, startCron);
    const result = await series(Promise.all(jobs));
    ctx.body = result
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

if (!isDev) {
  const scheduleJob = new CronJob("0 0 0 */1 * *", async () => {
    console.log("CRONJOB RUNNING - SCHEDULE - " + moment().format());
    const ids = ["001", "004", "009", "015", "018", "027", "037", "040", "045", "046"]
    const jobs = map(ids, startCron);
    const result = await series(Promise.all(jobs));
    console.log({result})
  });
  scheduleJob.start();
}

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});
router.all(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
);
app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000

app.listen(PORT, () => console.log(`BACKEND is running at ${PORT} ${process.env.isDev}`));

import prom from 'prom-client'
import express from 'express'
import urllib from 'urllib'

const venstar_TempF = new prom.Gauge({
  name: 'venstar_TempF',
  help: 'Temperature (F)',
  labelNames: [
    'deviceName'
  ]
})

const venstar_Humidity = new prom.Gauge({
  name: 'venstar_Humidity',
  help: 'Humidity (%)',
  labelNames: [
    'deviceName'
  ]
})

const venstar_State = new prom.Gauge({
  name: 'venstar_State',
  help: 'State',
  labelNames: [
    'deviceName'
  ]
})

async function getAll() {
  const response = await urllib.request(
    `https://${process.env.VENSTAR_IP ?? ''}/query/info`,
    {
      dataType: 'json',
      digestAuth: `${process.env.VENSTAR_USERNAME}:${process.env.VENSTAR_PASSWORD}`,
      rejectUnauthorized: false
    }
  )

  return response.data
}

async function getMetrics() {
  const json = await getAll()
  venstar_TempF.set({ deviceName: json.name }, Number(json.spacetemp))
  venstar_Humidity.set({ deviceName: json.name }, Number(json.hum))
  venstar_State.set({ deviceName: json.name }, Number(json.state))

  return prom.register.metrics()
}

function main() {
  const app = express()

  app.get(process.env.HEALTH_PATH ?? '/healthz', (_req, res) => res.send({status: 'up'}))

  app.get(process.env.METRICS_PATH ?? '/metrics', async (req, res) => {
    let metrics: string
    try {
      metrics = await getMetrics()
    }
    catch (e: any) {
      console.error('Error getting metrics!!!', e)
      res.status(500).send({ status: 'ERROR' })
      return
    }
    res.send(metrics)
  })

  app.listen(
    parseInt(process.env.PORT ?? '3000'),
    process.env.HOST ?? '0.0.0.0',
    () => console.log('Server is running!!!')
  )
}

try {
  main()
} catch (e: any) {
  console.error('Error during startup!!!')
  console.error(e.message, e.stack)
  process.exit(1)
}

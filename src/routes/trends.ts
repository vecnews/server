import { Hono } from 'hono'
import prisma from '../services/prisma'

const trends = new Hono()

trends.post('/', async (c) => {
  const body = await c.req.json()
  const { query, searchVolume, categories, trendBreakdown, active, increasePercentage, startTimestamp, endTimestamp } = body as {
    query: string
    searchVolume: number
    categories: (string | { id: number, name: string })[]
    trendBreakdown: string[]
    active: boolean
    increasePercentage: number
    startTimestamp: Date
    endTimestamp: Date
  }

  const trend = await prisma.googleTrend.upsert({
    where: {
      query_startTimestamp: {
        query,
        startTimestamp
      }
    },
    update: {
      active,
      searchVolume,
      categories: categories.map(cat => typeof cat === 'string' ? cat : cat.name),
      trendBreakdown: trendBreakdown || [],
      increasePercentage,
      startTimestamp,
      endTimestamp,
      updatedAt: new Date()
    },
    create: {
      query,
      searchVolume,
      categories: categories.map(cat => typeof cat === 'string' ? cat : cat.name),
      trendBreakdown: trendBreakdown || [],
      increasePercentage,
      active,
      startTimestamp,
      endTimestamp
    }
  })
  return c.json(trend)
})

trends.get('/', async (c) => {
  const trends = await prisma.googleTrend.findMany({
    orderBy: { updatedAt: 'desc' }
  })
  return c.json(trends)
})

trends.get('/active', async (c) => {
  const trends = await prisma.googleTrend.findMany({
    where: { active: true },
    orderBy: { updatedAt: 'desc' }
  })
  return c.json(trends)
})

// Deactivate a trend
trends.post('/:query/deactivate', async (c) => {
  const query = decodeURIComponent(c.req.param('query'))
  try {
    const trend = await prisma.googleTrend.updateMany({
      where: { query },
      data: {
        active: false,
        updatedAt: new Date()
      }
    })
    return c.json(trend)
  } catch (error) {
    return c.json({ error: 'Trend not found' }, 404)
  }
})

// Delete a trend
trends.delete('/:query', async (c) => {
  const query = decodeURIComponent(c.req.param('query'))
  try {
    await prisma.googleTrend.deleteMany({
      where: { query }
    })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Trend not found' }, 404)
  }
})

export default trends
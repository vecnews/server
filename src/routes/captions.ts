import { Hono } from 'hono'
import prisma from '../services/prisma'

const captions = new Hono()

captions.post('/:streamId', async (c) => {
  const streamId = c.req.param('streamId')
  const { text } = await c.req.json()
  try {
    const caption = await prisma.caption.create({
      data: {
        text,
        streamId
      }
    })
    return c.json(caption)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

captions.get('/:streamId', async (c) => {
  const streamId = c.req.param('streamId')
  try {
    const captions = await prisma.caption.findMany({
      where: { streamId },
      orderBy: { createdAt: 'desc' }
    })
    return c.json(captions)
  } catch (error) {
    return c.json({ error: 'Invalid stream ID' }, 400)
  }
})

export default captions 
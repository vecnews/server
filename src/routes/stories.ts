import { Hono } from 'hono'
import prisma from '../services/prisma'

const stories = new Hono()

stories.post('/', async (c) => {
  const { headline } = await c.req.json()
  const story = await prisma.story.create({
    data: { headline }
  })
  return c.json(story)
})

stories.get('/', async (c) => {
  const stories = await prisma.story.findMany({
    include: {
      developments: true
    },
    orderBy: { createdAt: 'desc' }
  })
  return c.json(stories)
})

stories.get('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        developments: true
      }
    })
    if (!story) return c.json({ error: 'Story not found' }, 404)
    return c.json(story)
  } catch (error) {
    return c.json({ error: 'Invalid story ID' }, 400)
  }
})

stories.post('/:id/developments', async (c) => {
  const storyId = c.req.param('id')
  const { text, blurb = false, images = [], sources = [] } = await c.req.json()

  try {
    const development = await prisma.$transaction(async (tx) => {
      const development = await tx.development.create({
        data: {
          text,
          blurb,
          storyId,
          image: images.map((img: { url: string; description?: string }) => img.url)
        }
      })

      if (sources.length > 0) {
        await tx.source.createMany({
          data: sources.map((source: { url?: string; text?: string }) => ({
            url: source.url,
            text: source.text
          }))
        })
      }

      return development
    })

    return c.json(development)
  } catch (error) {
    return c.json({ error: 'Failed to create development' }, 400)
  }
})

stories.get('/:id/developments', async (c) => {
  const storyId = c.req.param('id')
  try {
    const developments = await prisma.development.findMany({
      where: { storyId },
      orderBy: { createdAt: 'desc' }
    })
    return c.json(developments)
  } catch (error) {
    return c.json({ error: 'Invalid story ID' }, 400)
  }
})

stories.delete('/:storyId/developments/:developmentId', async (c) => {
  const developmentId = c.req.param('developmentId')
  try {
    await prisma.development.delete({
      where: { id: developmentId }
    })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Invalid development ID' }, 400)
  }
})

stories.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await prisma.story.delete({
      where: { id }
    })
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Invalid story ID' }, 400)
  }
})

export default stories 
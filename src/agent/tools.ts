import { generateObject, embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { Pinecone } from '@pinecone-database/pinecone'
import prisma from '../services/prisma'
import { getJson } from 'serpapi'
import type { Development } from '@prisma/client'

const vs = new Pinecone().index('news').namespace('')

async function getImageFromQuery(query: string) {
  const result = await getJson({
    api_key: process.env.SERPAPI_API_KEY,
    engine: "google_images",
    q: query,
    google_domain: "google.com",
    hl: "en",
    gl: "us",
  })

  return result.images_results?.[0]?.original || null;
}

async function findSimilarStories(blurb: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: blurb,
  })

  const result = await vs.query({
    topK: 1,
    vector: embedding,
    includeMetadata: true,
  })

  if (result.matches.length === 0) {
    return null;
  }

  const bestMatch = result.matches[0];
  return bestMatch.metadata?.storyId || null;
}

async function upsertDevelopment(development: Development) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: development.text,
  })

  await vs.upsert([{
    id: development.id,
    values: embedding,
    metadata: {
      storyId: development.storyId,
    },
  }])

}

// should create a story with the given headline and blurb
async function createNewStory(headline: string, text: string, image_query: string, sources: string[]) {
  const image = await getImageFromQuery(image_query)

  const story = await prisma.story.create({
    data: {
      headline,
      developments: {
        create: {
          text,
          blurb: true,
          images: [image],
          sources: {
            create: sources.map((source) => ({ url: source })),
          },
        },
      },
    },
    include: {
      developments: true,
    }
  })

  await upsertDevelopment(story.developments[0])
}

async function addDevelopmentToStory(storyId: string, text: string, image_query: string, sources: string[]) {
  const development = await prisma.development.create({
    data: {
      text,
      images: [],
      sources: {
        create: sources.map((source) => ({ url: source })),
      },
      story: {
        connect: {
          id: storyId
        }
      }
    },
  })

  await upsertDevelopment(development)
}



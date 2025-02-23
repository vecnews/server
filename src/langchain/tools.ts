import Exa from "exa-js";
import { config } from 'dotenv'
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "../services/prisma";
import { searchForImage } from "./helpers";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

config({ path: "../../.env" })

const exa = new Exa();
const vs = new Pinecone().index('news').namespace('news');

export const getTextFromLinks = tool(async ({ links }: { links: string[] }) => {
  const result = await exa.getContents(links, {
    text: true,
    livecrawl: "always"
  })
  return result;
}, {
  name: "getTextFromLinks",
  description: "Get the text from a list of links",
  schema: z.object({
    links: z.array(z.string())
  })
})

export const findSimilarStories = tool(async ({ blurb }: { blurb: string }) => {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: blurb
  })

  const results = await vs.query({
    vector: embedding,
    topK: 10,
    includeMetadata: true
  })

  return results;
}, {
  name: "findSimilarStories",
  description: "Find similar stories to a given blurb",
  schema: z.object({
    blurb: z.string()
  })
})

export const createStory = tool(async ({ headline, description, image_query }: { headline: string, description: string, image_query: string }) => {
  const image = await searchForImage(image_query);

  const story = await prisma.story.create({
    data: {
      headline,
      developments: {
        create: {
          text: description,
          blurb: true,
          image: image
        }
      }
    },
    include: {
      developments: true
    }
  })

  return story;
}, {
  name: "createStory",
  description: "Create a story",
  schema: z.object({
    headline: z.string(),
    description: z.string(),
    image_query: z.string()
  })
})

export const createDevelopment = tool(async ({ storyId, description, image_query }: { storyId: string, description: string, image_query: string }) => {
  return await prisma.development.create({
    data: {
      storyId,
      text: description,
      blurb: true,
    }
  })
}

  const image = await searchForImage(image_query);

const development = await prisma.development.create({
  data: {
    storyId,
    text: description,
    blurb: true,
    image: image
  }
})

return development;
}

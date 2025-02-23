import Exa from "exa-js";
import { config } from 'dotenv'
import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import prisma from "../services/prisma";
import { searchForImage } from "./helpers";

const exa = new Exa();

const vs = new Pinecone().index('news').namespace('news');

export const getTextFromLinks = async (links: string[]) => {
  const result = await exa.getContents(links, {
    text: true,
    livecrawl: "always"
  })
  return result;
}

export const findSimilarStories = async (blurb: string) => {
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
}



export const createStory = async (headline: string, description: string, image_query: string) => {
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
}

export const createDevelopment = async (storyId: string, description: string, image_query: string) => {
  if (!image_query) {
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

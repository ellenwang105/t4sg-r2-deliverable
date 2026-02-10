/* eslint-disable */
import OpenAI from "openai";
import { env } from "@/env.mjs";

const openai = env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export async function generateResponse(message: string): Promise<string> {
  if (!openai || !env.OPENAI_API_KEY) {
    return "I apologize, but the chatbot service is not configured. Please add OPENAI_API_KEY to your .env file.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a specialized chatbot that answers questions about animals and species. You can provide information about habitat, diet, conservation status, behavior, physical characteristics, and other animal-related facts. If a user asks about something unrelated to animals or species, politely remind them that you specialize in species-related queries only. Be friendly, informative, and accurate in your responses.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      return "I apologize, but I couldn't generate a response. Please try again.";
    }
    return text;
  } catch (error) {
    console.error("Error generating response:", error);
    if (error instanceof Error) {
      if (error.message.includes("API_KEY") || error.message.includes("Incorrect API key")) {
        return "I apologize, but there's an issue with the API key. Please check OPENAI_API_KEY in your .env file.";
      }
      if (error.message.includes("quota") || error.message.includes("rate limit")) {
        return "I apologize, but the API quota has been exceeded. Please try again later.";
      }
    }
    return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
  }
}

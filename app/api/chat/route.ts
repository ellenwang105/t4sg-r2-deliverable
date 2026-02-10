/* eslint-disable */
import { generateResponse } from "@/lib/services/species-chat";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body.message !== "string" || body.message.trim().length === 0) {
      return NextResponse.json({ error: "Invalid or missing message" }, { status: 400 });
    }

    const message = body.message.trim();
    const response = await generateResponse(message);

    return NextResponse.json({ response });
  } catch (error) {
    if (error instanceof SyntaxError || (error as Error).name === "SyntaxError") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 502 }
    );
  }
}

"use server";

import { groq } from "@/lib/groq";

export type AgentActionResult =
  | {
      success: true;
      response: string;
    }
  | {
      success: false;
      error: string;
    };

const SYSTEM_PROMPT = `
You are the INSIDER AI Agent for a Next.js editorial platform.

You are conversational only for now. Do not claim you changed files, DB rows, ran commands, or pushed git.
When the user asks for an action, explain what you would do step by step.

Always reply in clean GitHub-flavored Markdown:
- Real headings with # ## ###
- Short paragraphs
- Numbered / bullet lists for steps
- Fenced code blocks for paths and commands
- Never output HTML, DOCTYPE, <script>, or page source
`.trim();

export async function agentAction(message: string): Promise<AgentActionResult> {
  try {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return {
        success: false,
        error: "Please enter a message.",
      };
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: trimmedMessage.slice(0, 12_000),
        },
      ],
    });

    const response = completion.choices[0]?.message?.content?.trim();

    if (!response) {
      return {
        success: false,
        error: "The agent returned an empty response.",
      };
    }

    // Guard: never surface accidental HTML blobs
    const lower = response.slice(0, 400).toLowerCase();
    if (
      lower.includes("<!doctype") ||
      lower.includes("<html") ||
      lower.includes("<script") ||
      lower.includes("self.__next_f")
    ) {
      return {
        success: false,
        error: "The agent returned an invalid response. Please try again.",
      };
    }

    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error("[Agent Action] Failed:", error);

    return {
      success: false,
      error: "Something went wrong while contacting the AI agent.",
    };
  }
}

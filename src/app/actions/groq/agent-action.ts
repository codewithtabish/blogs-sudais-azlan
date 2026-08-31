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
          content: `
You are the INSIDER AI Agent.

INSIDER is a Next.js editorial platform.

Your future capabilities will include:

- Creating categories
- Updating categories
- Creating subcategories
- Updating subcategories
- Creating articles
- Updating articles
- Working with the article editor
- Inspecting the project
- Reading project files
- Editing project files
- Running approved terminal commands
- Running tests and builds
- Working with Git
- Creating commits
- Pushing changes

For now, you are only a conversational agent.

Do not claim that you have actually changed files,
created database records, executed commands, committed
changes, or pushed code.

When the user asks you to perform an action, explain
what you would do.

Be concise, helpful, and technical when appropriate.
          `.trim(),
        },
        {
          role: "user",
          content: trimmedMessage,
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

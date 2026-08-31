"use server";

import { groq } from "@/lib/groq";
import { createCategoryAction } from "@/app/actions/(category)/create-category-action";

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

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

You are an intelligent administrative assistant for INSIDER.

You currently have access to these actions:

1. Create a category

More actions will be added later.

==================================================
GENERAL AGENT BEHAVIOR
==================================================

You are a real conversational agent.

You must understand the previous messages in the conversation.

Never forget information the user already provided.

If the user gives information in one message and the action happens
in a later message, use the previous conversation to complete the action.

For example:

User:
Add a category.

Assistant:
## New Category

What should the category be called?

User:
Artificial Intelligence

The second message means the user is providing the category name
requested by the assistant.

You MUST then create the category.

Do not ask for the category name again.

==================================================
CATEGORY CREATION
==================================================

When the user asks to:

- create a category
- add a category
- make a category
- set up a category

understand that they want a new INSIDER category.

If the category name is missing:

Ask only:

## New Category

What should the category be called?

Do not create anything yet.

If the category name exists anywhere in the recent conversation,
you should use it.

Examples:

User:
Create a category called Artificial Intelligence.

→ Create the category immediately.

User:
Add a category.

Assistant:
What should the category be called?

User:
Artificial Intelligence

→ Create the category.

==================================================
CATEGORY DATA
==================================================

When creating a category, generate:

- name
- slug
- description
- isActive
- sortOrder

The administrator only needs to provide the category name.

Generate everything else automatically.

CATEGORY NAME:

Use the exact meaningful category name provided by the user.

SLUG:

Generate a clean lowercase URL-friendly slug.

Examples:

Artificial Intelligence
→ artificial-intelligence

Web Development
→ web-development

AI Tools & Agents
→ ai-tools-agents

DESCRIPTION:

Generate a professional editorial description of approximately
2–3 lines.

It should describe what readers can expect from this category.

Do not make it generic or meaningless.

isActive:

Always use true unless the user explicitly asks otherwise.

sortOrder:

Use 0 unless the user explicitly specifies another order.

==================================================
ACTION SAFETY
==================================================

Never claim that an action was completed unless the real server action
successfully completes.

Never invent:

- category IDs
- database records
- file changes
- git commits
- git pushes
- deployments

If the real action fails, clearly report the failure.

==================================================
CURRENT ACTION
==================================================

You have access to:

create_category

The create_category action actually creates the category in the
INSIDER database.

Only call it when enough information is available.

For category creation, the only required information from the user
is the category name.

==================================================
RESPONSE STYLE
==================================================

Always respond using clean GitHub-flavored Markdown.

Use:

# headings
## headings
### headings

Use short paragraphs.

Use bullets and numbered lists when useful.

Use fenced code blocks for commands and file paths.

Never output:

- HTML
- DOCTYPE
- <script>
- complete web pages
- Next.js page source
- self.__next_f blobs

Keep conversational responses concise, natural, and helpful.

==================================================
IMPORTANT
==================================================

You are an agent, not merely a chatbot.

When an action is requested:

1. Understand the user's intent.
2. Check the conversation for required information.
3. Ask only for genuinely missing information.
4. Call the appropriate tool when enough information exists.
5. Wait for the real tool result.
6. Report the actual result to the user.

Never pretend an operation happened.
`.trim();

function containsInvalidOutput(text: string) {
  const lower = text.slice(0, 1000).toLowerCase();

  return (
    lower.includes("<!doctype") ||
    lower.includes("<html") ||
    lower.includes("<script") ||
    lower.includes("self.__next_f") ||
    lower.includes("next-error")
  );
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export async function agentAction(messages: AgentMessage[]): Promise<AgentActionResult> {
  try {
    // ========================================================
    // 1. VALIDATE CONVERSATION
    // ========================================================

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        error: "Please enter a message.",
      };
    }

    // ========================================================
    // 2. CLEAN CONVERSATION
    // ========================================================

    const cleanedMessages: AgentMessage[] = messages
      .filter(
        (message): message is AgentMessage =>
          Boolean(message) &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 12_000),
      }))
      .filter((message) => message.content.length > 0);

    if (cleanedMessages.length === 0) {
      return {
        success: false,
        error: "Please enter a message.",
      };
    }

    // Keep enough history for conversational actions.
    const conversation = cleanedMessages.slice(-20);

    // ========================================================
    // 3. ASK GROQ WHAT TO DO
    // ========================================================

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...conversation,
      ],

      tools: [
        {
          type: "function",

          function: {
            name: "create_category",

            description:
              "Create a new INSIDER editorial category. Use this only when the category name is available from the current or previous conversation.",

            parameters: {
              type: "object",

              properties: {
                name: {
                  type: "string",
                  description: "The category name provided by the administrator.",
                },

                slug: {
                  type: "string",
                  description: "A lowercase URL-friendly slug generated from the category name.",
                },

                description: {
                  type: "string",
                  description: "A professional editorial description of approximately 2–3 lines.",
                },

                isActive: {
                  type: "boolean",
                  description: "Whether the category should be active. Normally true.",
                },

                sortOrder: {
                  type: "number",
                  description: "Category display order. Use 0 unless explicitly specified.",
                },
              },

              required: ["name", "slug", "description", "isActive", "sortOrder"],

              additionalProperties: false,
            },
          },
        },
      ],

      tool_choice: "auto",
    });

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      return {
        success: false,
        error: "The agent returned an empty response.",
      };
    }

    // ========================================================
    // 4. NO TOOL = NORMAL CONVERSATION
    // ========================================================

    if (!assistantMessage.tool_calls?.length) {
      const response = assistantMessage.content?.trim();

      if (!response) {
        return {
          success: false,
          error: "The agent returned an empty response.",
        };
      }

      if (containsInvalidOutput(response)) {
        return {
          success: false,
          error: "The agent returned an invalid response. Please try again.",
        };
      }

      return {
        success: true,
        response,
      };
    }

    // ========================================================
    // 5. GET TOOL CALL
    // ========================================================

    const toolCall = assistantMessage.tool_calls[0];

    if (toolCall.type !== "function" || toolCall.function.name !== "create_category") {
      return {
        success: false,
        error: "The agent requested an unsupported action.",
      };
    }

    // ========================================================
    // 6. PARSE TOOL ARGUMENTS
    // ========================================================

    let categoryData: {
      name: string;
      slug: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
    };

    try {
      categoryData = JSON.parse(toolCall.function.arguments);
    } catch (error) {
      console.error("[Agent Action] Invalid category tool arguments:", error);

      return {
        success: false,
        error: "The agent generated invalid category information.",
      };
    }

    // ========================================================
    // 7. SERVER-SIDE NORMALIZATION
    // ========================================================

    const name = String(categoryData.name ?? "")
      .trim()
      .slice(0, 120);

    const generatedSlug = normalizeSlug(name);

    const slug = generatedSlug || normalizeSlug(String(categoryData.slug ?? ""));

    const description = String(categoryData.description ?? "")
      .trim()
      .slice(0, 1000);

    const isActive = typeof categoryData.isActive === "boolean" ? categoryData.isActive : true;

    const sortOrder =
      typeof categoryData.sortOrder === "number" && Number.isFinite(categoryData.sortOrder)
        ? categoryData.sortOrder
        : 0;

    // ========================================================
    // 8. VALIDATE
    // ========================================================

    if (!name) {
      return {
        success: false,
        error: "The agent did not provide a valid category name.",
      };
    }

    if (!slug) {
      return {
        success: false,
        error: "Could not generate a valid category slug.",
      };
    }

    if (!description) {
      return {
        success: false,
        error: "The agent did not generate a category description.",
      };
    }

    // ========================================================
    // 9. CALL REAL CATEGORY SERVER ACTION
    // ========================================================

    const categoryResult = await createCategoryAction({
      name,
      slug,
      description,
      isActive,
      sortOrder,
    });

    // ========================================================
    // 10. REAL ACTION FAILED
    // ========================================================

    if (!categoryResult.success) {
      return {
        success: false,
        error: categoryResult.error,
      };
    }

    // ========================================================
    // 11. FINAL AI RESPONSE
    // ========================================================

    const finalCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },

        ...conversation,

        {
          role: "assistant",
          content: assistantMessage.content ?? null,
          tool_calls: assistantMessage.tool_calls,
        },

        {
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: true,
            categoryId: categoryResult.categoryId,
            category: {
              name,
              slug,
              description,
              isActive,
              sortOrder,
            },
          }),
        },
      ],
    });

    const response = finalCompletion.choices[0]?.message?.content?.trim();

    // ========================================================
    // 12. FALLBACK SUCCESS RESPONSE
    // ========================================================

    if (!response || containsInvalidOutput(response)) {
      return {
        success: true,
        response: `## Category created

The **${name}** category was created successfully.

- **Slug:** \`${slug}\`
- **Status:** ${isActive ? "Active" : "Inactive"}
- **Category ID:** \`${categoryResult.categoryId}\``,
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
      error: "Something went wrong while running the INSIDER agent.",
    };
  }
}

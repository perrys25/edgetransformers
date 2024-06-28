"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import {
  ReadableStream,
  RoleScopedChatInput,
} from "@cloudflare/workers-types/2023-07-01/index";
import { createStreamableValue } from "ai/rsc";

export async function chatCompletion(
  model: BaseAiTextGenerationModels | undefined,
  prompt: RoleScopedChatInput[],
) {
  const context = getRequestContext();
  try {
    const run = (await context.env.AI.run(model ?? "@hf/google/gemma-7b-it", {
      messages: prompt,
      stream: false,
    })) as {
      response?: string;
      tool_calls?: {
        name: string;
        arguments: unknown;
      }[];
    };

    const response = run.response;

    if (!response) {
      return null;
    }
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}

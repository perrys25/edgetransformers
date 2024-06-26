"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { RoleScopedChatInput } from "@cloudflare/workers-types/2023-07-01/index";

export async function chatCompletion(
  model: BaseAiTextGenerationModels | undefined,
  prompt: RoleScopedChatInput[],
) {
  const context = getRequestContext();

  const response = (
    (await context.env.AI.run(model ?? "@hf/google/gemma-7b-it", {
      messages: prompt,
    })) as { response: string }
  ).response;

  return response;
}

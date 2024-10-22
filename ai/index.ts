import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { experimental_wrapLanguageModel as wrapLanguageModel } from "ai";

import { customMiddleware } from "./custom-middleware";

export const geminiProModel = wrapLanguageModel({
  model: google("gemini-1.5-pro-002"),
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: google("gemini-1.5-flash-002"),
  middleware: customMiddleware,
});

export const openaiModel = wrapLanguageModel({
  model: openai("gpt-4o-mini"),
  middleware: customMiddleware,
});

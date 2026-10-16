/**
 * Extracted from the Apollo conversation surface so the interactive demos
 * reuse the real implementation instead of a lookalike copy.
 */

export type Persona = {
  title: string;
  subtitle: string;
  prompt: string;
};

export type MessageBlock =
  | { type: "text"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "draft"; text: string }
  | { type: "actions"; items: string[] };

export type ChatMessage = {
  role: "user" | "apollo";
  blocks: MessageBlock[];
};

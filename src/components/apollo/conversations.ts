import type { ChatMessage, MessageBlock, Persona } from './types';

/**
 * Extracted from the Apollo conversation surface so the interactive demos
 * reuse the real implementation instead of a lookalike copy.
 */

export const PERSONAS: Persona[] = [
  {
    title: "Leasing Agent",
    subtitle: "Turn every tour into a lease, not a to-do list.",
    prompt:
      "I was in tours all day — who haven't I marked shown or written notes for?",
  },
  {
    title: "Maintenance Tech",
    subtitle: "Hands on the repair, Apollo handles the rest.",
    prompt:
      "Unit 204 is having an issue with the disposal. What should I look at first?",
  },
  {
    title: "Community Manager",
    subtitle: "More face time with residents, less time chasing follow-ups.",
    prompt:
      "List all of my upcoming move-ins this month and draft a mass welcome text message with a move-in checklist reminder for all of them.",
  },
  {
    title: "Regionals & Executives",
    subtitle: "The end of dashboards, the start of strategy.",
    prompt:
      "Break down move-outs into controllable vs. uncontrollable reasons across the portfolio. Take conversation history into account in your analysis.",
  },
];

export const EXCHANGES: ChatMessage[][] = [
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "I was in tours all day — who haven't I marked shown or written notes for?",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "One tour needs marking: Annabel Donovan's self-guided tour on July 1. Mark as shown?",
        },
      ],
    },
    { role: "user", blocks: [{ type: "text", text: "Yes." }] },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "Done. Annabel's still in Inquiry status, AI assistant active.",
        },
      ],
    },
    {
      role: "user",
      blocks: [
        { type: "text", text: "What else should I do for her follow-up?" },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "The post-tour cadence is already running automatically (follow-ups at 2 hrs, 2 days, 4 days, 12 days). Beyond that, I'd send a personal note, send a quote for the studio she toured, and assign a leasing agent — no one's on her account yet. I went ahead and drafted the personal note:",
        },
        {
          type: "draft",
          text: "Hi Annabel, thanks for touring the studio on July 1! Let me know if you have questions on pricing or the application — happy to send a quote whenever you're ready.",
        },
        { type: "actions", items: ["Send", "Edit"] },
      ],
    },
    { role: "user", blocks: [{ type: "text", text: "Send it." }] },
    { role: "apollo", blocks: [{ type: "text", text: "Sent." }] },
  ],
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "Unit 204 is having an issue with the disposal. What should I look at first?",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "Check the disposal before snaking — this unit has a repeat pattern of jams and slow drains.",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Clear the disposal (steel wool jammed it last time).",
            "If clear, snake the branch line — recurring slow drains suggest buildup past the trap.",
            "Pull the P-trap and check under the cabinet — past jobs found a clog and leak together.",
          ],
        },
        {
          type: "text",
          text: "Four prior plumbing orders on this unit (kitchen + bath), including a recurring under-cabinet leak alongside drainage issues:",
        },
        {
          type: "list",
          items: [
            "Kitchen sink leak + inoperative disposal — repaired",
            "Bath/kitchen under-cabinet leaks — fixed",
            "Tub/shower not draining — cleared",
          ],
        },
      ],
    },
  ],
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "List all of my upcoming move-ins this month and draft a mass welcome text message with a move-in checklist reminder for all of them.",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        { type: "text", text: "You've got two upcoming June move-ins:" },
        {
          type: "table",
          columns: ["Resident", "Community", "Unit", "Move-in", "SMS status"],
          rows: [
            [
              "Jane Stewart",
              "Balance Bay",
              "12",
              "June 18",
              "INVALID — can't text",
            ],
            ["Maya Martin", "Chicagoland", "34", "June 30", "Opted in"],
          ],
        },
        {
          type: "text",
          text: "Heads-up: Jane's number is invalid for SMS, so only Maya would actually receive a text — you may want to reach her by email instead.\nHere's a draft welcome message for both:",
        },
        {
          type: "draft",
          text: "Hi [first name], welcome to [community name]! We're so excited to have you joining us. Your move-in is coming up soon, and you can get a head start by completing your move-in checklist right in your resident portal. It walks you through everything you need before move-in day. Reach out anytime if you have questions. We can't wait to welcome you home!",
        },
        {
          type: "text",
          text: "Want me to send this? Texting Maya and handling Jane over email?",
        },
      ],
    },
    { role: "user", blocks: [{ type: "text", text: "Yes, let’s do that!" }] },
  ],
  [
    {
      role: "user",
      blocks: [
        {
          type: "text",
          text: "Break down move-outs into controllable vs. uncontrollable reasons across the portfolio. Take conversation history into account in your analysis.",
        },
      ],
    },
    {
      role: "apollo",
      blocks: [
        {
          type: "text",
          text: "58% of the last 12 months’ churn value is controllable: $842.6K across 51 move-outs, vs. $512.3K uncontrollable. Full breakdown on the Portfolio Churn dashboard.\nControllable dollars by driver (leases can cite more than one, so rows overlap):",
        },
        {
          type: "table",
          columns: ["Driver", "Move-outs", "Annualized rent"],
          rows: [
            ["Rent increase / better value elsewhere", "23", "$391,500"],
            ["Community issues (noise, safety)", "21", "$358,940"],
            ["Service & staff complaints", "19", "$311,220"],
            ["Maintenance issues", "17", "$284,600"],
          ],
        },
      ],
    },
  ],
];

export function userMessageText(message: ChatMessage) {
  return message.blocks
    .filter(
      (block): block is Extract<MessageBlock, { type: "text" }> =>
        block.type === "text",
    )
    .map((block) => block.text)
    .join("\n");
}

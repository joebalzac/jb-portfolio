import type { DropdownOption } from './Dropdown';

/** Selectable scope for the composer. Fixtures — no live inventory. */
export const SCOPES: DropdownOption[] = [
  { value: 'cross-org', label: 'Cross-org', hint: 'Every community and connector' },
  { value: 'caladan', label: 'Caladan Lofts', hint: '248 units · Chicago' },
  { value: 'balance', label: 'Balance Bay', hint: '180 units · Tampa' },
  { value: 'chicagoland', label: 'Chicagoland', hint: '312 units · Chicago' },
];

/**
 * How much autonomy the agent has. The mode is surfaced in the composer
 * because it changes what a reply is allowed to do on the user's behalf.
 */
export const AGENT_MODES: DropdownOption[] = [
  { value: 'full', label: 'Full Agent', hint: 'Can draft and take actions' },
  { value: 'assist', label: 'Assist', hint: 'Suggests, never sends' },
  { value: 'read', label: 'Read only', hint: 'Answers from data alone' },
];

/** Reasoning variants shown in the agent menu. Fixtures. */
export const MODELS: DropdownOption[] = [
  { value: 'sol-high', label: 'GPT 6.1 Sol (high reasoning)', hint: 'Slowest, best on multi-step work' },
  { value: 'sol-balanced', label: 'GPT 6.1 Sol (balanced)', hint: 'Default for everyday questions' },
  { value: 'sol-fast', label: 'GPT 6.1 Sol (fast)', hint: 'Quick lookups and summaries' },
];

/** `@` mentionable records. */
export const ENTITIES: DropdownOption[] = [
  { value: 'caladan', label: 'Caladan Lofts', hint: 'Community' },
  { value: 'unit-204', label: 'Unit 204', hint: 'Unit · Caladan Lofts' },
  { value: 'annabel', label: 'Annabel Donovan', hint: 'Prospect' },
  { value: 'maya', label: 'Maya Martin', hint: 'Resident' },
];

/** `@` mentionable integrations. */
export const CONNECTORS: DropdownOption[] = [
  { value: 'pms', label: 'Property management system', hint: 'Leases, units, residents' },
  { value: 'crm', label: 'Leasing CRM', hint: 'Prospects and tours' },
  { value: 'calendar', label: 'Calendar', hint: 'Tour availability' },
  { value: 'inbox', label: 'Shared inbox', hint: 'Email and SMS threads' },
];

/** `/` invocable skills. */
export const SKILLS: DropdownOption[] = [
  { value: 'draft', label: 'Draft a message', hint: 'Email or SMS, from context' },
  { value: 'summarize', label: 'Summarise a thread', hint: 'Condense a conversation' },
  { value: 'rent-roll', label: 'Pull the rent roll', hint: 'Current charges by unit' },
  { value: 'availability', label: 'Check availability', hint: 'Units and tour slots' },
];

export const ATTACH_OPTIONS: DropdownOption[] = [
  { value: 'lease', label: 'Lease document', hint: 'PDF' },
  { value: 'photo', label: 'Unit photo', hint: 'Image' },
  { value: 'report', label: 'Rent roll export', hint: 'CSV' },
];

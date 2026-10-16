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

export const ATTACH_OPTIONS: DropdownOption[] = [
  { value: 'lease', label: 'Lease document', hint: 'PDF' },
  { value: 'photo', label: 'Unit photo', hint: 'Image' },
  { value: 'report', label: 'Rent roll export', hint: 'CSV' },
];

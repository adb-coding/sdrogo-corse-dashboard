/**
 * Keeps the trigger width stable: one pick shows its name, several collapse to
 * a count instead of a comma list that would stretch the control.
 */
export function summarizeSelection(selected: string[], allLabel: string): string {
  const picked = selected.filter(s => s !== 'all')
  if (picked.length === 0) return allLabel
  if (picked.length === 1) return picked[0]
  return `${picked.length} selezionati`
}

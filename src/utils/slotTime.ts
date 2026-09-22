export function slotEndDate(slot: { slotDate: string; endTime: string }): Date {
  return new Date(`${slot.slotDate}T${slot.endTime.slice(0, 5)}`)
}

export function isSlotEnded(slot: { slotDate: string; endTime: string }, now: Date = new Date()): boolean {
  return slotEndDate(slot).getTime() <= now.getTime()
}
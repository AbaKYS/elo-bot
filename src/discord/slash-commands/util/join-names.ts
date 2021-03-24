export function joinNames(players: { name: string }[]): string {
  return players.map((player) => player.name).join(", ");
}

export function joinStrings(strings: string[]): string {
  return strings.join(", ");
}

const NAME_FREQUENCY = new Set<string>([
  "adam",
  "alex",
  "alice",
  "anna",
  "bob",
  "chris",
  "david",
  "emma",
  "ethan",
  "jack",
  "james",
  "john",
  "leo",
  "lucas",
  "maria",
  "max",
  "mike",
  "noah",
  "olivia",
  "satoshi",
]);

export function isPopularName(name: string): boolean {
  return NAME_FREQUENCY.has(name.toLowerCase());
}


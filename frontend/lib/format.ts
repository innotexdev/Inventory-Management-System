export const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function formatDate(value: string | null): string {
  return value === null ? EMPTY_VALUE : dateFormatter.format(new Date(value));
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`;
}

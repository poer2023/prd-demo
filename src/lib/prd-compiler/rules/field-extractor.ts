const FIELD_REQUIREMENT_REGEX = /(?:字段|field|input)[:：]\s*([a-zA-Z0-9_\-\u4e00-\u9fa5]+)/i;

export function inferFieldNames(requirements: string[]): string[] {
  const fields: string[] = [];
  for (const requirement of requirements) {
    const match = requirement.match(FIELD_REQUIREMENT_REGEX);
    if (match?.[1]) fields.push(match[1]);
  }
  return fields;
}

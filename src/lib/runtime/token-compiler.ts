import type { DesignTokens } from "@/lib/protospec";

export type CssVariables = Record<string, string>;

export function compileTokensToCssVariables(tokens: DesignTokens, prefix: string = "--proto"): CssVariables {
  return {
    [`${prefix}-color-background`]: tokens.color.background,
    [`${prefix}-color-surface`]: tokens.color.surface,
    [`${prefix}-color-primary`]: tokens.color.primary,
    [`${prefix}-color-secondary`]: tokens.color.secondary,
    [`${prefix}-color-text`]: tokens.color.text,
    [`${prefix}-color-muted-text`]: tokens.color.mutedText,
    [`${prefix}-color-border`]: tokens.color.border,
    [`${prefix}-typography-font-family`]: tokens.typography.fontFamily,
    [`${prefix}-typography-font-size-base`]: tokens.typography.fontSizeBase,
    [`${prefix}-typography-font-size-heading`]: tokens.typography.fontSizeHeading,
    [`${prefix}-typography-line-height`]: tokens.typography.lineHeight,
    [`${prefix}-spacing-xs`]: tokens.spacing.xs,
    [`${prefix}-spacing-sm`]: tokens.spacing.sm,
    [`${prefix}-spacing-md`]: tokens.spacing.md,
    [`${prefix}-spacing-lg`]: tokens.spacing.lg,
    [`${prefix}-spacing-xl`]: tokens.spacing.xl,
    [`${prefix}-radius-sm`]: tokens.radius.sm,
    [`${prefix}-radius-md`]: tokens.radius.md,
    [`${prefix}-radius-lg`]: tokens.radius.lg,
    [`${prefix}-shadow-sm`]: tokens.shadow.sm,
    [`${prefix}-shadow-md`]: tokens.shadow.md,
    [`${prefix}-shadow-lg`]: tokens.shadow.lg,
  };
}

export function serializeCssVariables(variables: CssVariables, selector: string = ":root"): string {
  const lines = Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

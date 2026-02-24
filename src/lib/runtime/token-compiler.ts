import type { DesignTokens } from "@/lib/protospec";

export type CssVariables = Record<string, string>;

type TokenOverrides = {
  color?: Partial<DesignTokens["color"]>;
  typography?: Partial<DesignTokens["typography"]>;
  spacing?: Partial<DesignTokens["spacing"]>;
  radius?: Partial<DesignTokens["radius"]>;
  shadow?: Partial<DesignTokens["shadow"]>;
};

export interface TokenCompileOptions {
  prefix?: string;
  themeMode?: "light" | "dark";
  overrides?: TokenOverrides;
}

function normalizeOptions(optionsOrPrefix: TokenCompileOptions | string): TokenCompileOptions {
  if (typeof optionsOrPrefix === "string") {
    return { prefix: optionsOrPrefix };
  }
  return optionsOrPrefix;
}

function applyThemeMode(tokens: DesignTokens, themeMode: "light" | "dark"): DesignTokens {
  if (themeMode === "light") return tokens;
  return {
    ...tokens,
    color: {
      ...tokens.color,
      background: "#0B1220",
      surface: "#111827",
      text: "#E5E7EB",
      mutedText: "#94A3B8",
      border: "#334155",
    },
    shadow: {
      ...tokens.shadow,
      sm: "0 1px 2px rgba(0, 0, 0, 0.24)",
      md: "0 8px 24px rgba(0, 0, 0, 0.32)",
      lg: "0 16px 40px rgba(0, 0, 0, 0.4)",
    },
  };
}

function applyOverrides(tokens: DesignTokens, overrides?: TokenOverrides): DesignTokens {
  if (!overrides) return tokens;
  return {
    ...tokens,
    color: { ...tokens.color, ...overrides.color },
    typography: { ...tokens.typography, ...overrides.typography },
    spacing: { ...tokens.spacing, ...overrides.spacing },
    radius: { ...tokens.radius, ...overrides.radius },
    shadow: { ...tokens.shadow, ...overrides.shadow },
  };
}

export function resolveRuntimeTokens(
  tokens: DesignTokens,
  optionsOrPrefix: TokenCompileOptions | string = {}
): DesignTokens {
  const options = normalizeOptions(optionsOrPrefix);
  const themed = applyThemeMode(tokens, options.themeMode ?? "light");
  return applyOverrides(themed, options.overrides);
}

export function compileTokensToCssVariables(
  tokens: DesignTokens,
  optionsOrPrefix: TokenCompileOptions | string = {}
): CssVariables {
  const options = normalizeOptions(optionsOrPrefix);
  const prefix = options.prefix ?? "--proto";
  const resolvedTokens = resolveRuntimeTokens(tokens, options);

  return {
    [`${prefix}-color-background`]: resolvedTokens.color.background,
    [`${prefix}-color-surface`]: resolvedTokens.color.surface,
    [`${prefix}-color-primary`]: resolvedTokens.color.primary,
    [`${prefix}-color-secondary`]: resolvedTokens.color.secondary,
    [`${prefix}-color-text`]: resolvedTokens.color.text,
    [`${prefix}-color-muted-text`]: resolvedTokens.color.mutedText,
    [`${prefix}-color-border`]: resolvedTokens.color.border,
    [`${prefix}-typography-font-family`]: resolvedTokens.typography.fontFamily,
    [`${prefix}-typography-font-size-base`]: resolvedTokens.typography.fontSizeBase,
    [`${prefix}-typography-font-size-heading`]: resolvedTokens.typography.fontSizeHeading,
    [`${prefix}-typography-line-height`]: resolvedTokens.typography.lineHeight,
    [`${prefix}-spacing-xs`]: resolvedTokens.spacing.xs,
    [`${prefix}-spacing-sm`]: resolvedTokens.spacing.sm,
    [`${prefix}-spacing-md`]: resolvedTokens.spacing.md,
    [`${prefix}-spacing-lg`]: resolvedTokens.spacing.lg,
    [`${prefix}-spacing-xl`]: resolvedTokens.spacing.xl,
    [`${prefix}-radius-sm`]: resolvedTokens.radius.sm,
    [`${prefix}-radius-md`]: resolvedTokens.radius.md,
    [`${prefix}-radius-lg`]: resolvedTokens.radius.lg,
    [`${prefix}-shadow-sm`]: resolvedTokens.shadow.sm,
    [`${prefix}-shadow-md`]: resolvedTokens.shadow.md,
    [`${prefix}-shadow-lg`]: resolvedTokens.shadow.lg,
  };
}

export function serializeCssVariables(variables: CssVariables, selector: string = ":root"): string {
  const lines = Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

/**
 * 设计规范类型定义
 */

export interface ColorToken {
  name: string;
  value: string;
  description?: string;
  category?: 'primary' | 'secondary' | 'neutral' | 'semantic' | 'other';
}

export interface TypographyToken {
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
  description?: string;
}

export interface SpacingToken {
  name: string;
  value: string;
  description?: string;
}

export interface ComponentSpec {
  name: string;
  description: string;
  props?: Record<string, {
    type: string;
    required?: boolean;
    default?: string;
    description?: string;
  }>;
  variants?: string[];
  examples?: string[];
  relatedComponents?: string[];
}

export interface PatternSpec {
  name: string;
  description: string;
  useCase: string;
  components?: string[];
  flow?: string;
  examples?: string[];
}

export interface PageSpec {
  name: string;
  path?: string;
  description: string;
  components?: string[];
  layout?: string;
  interactions?: string[];
}

export interface DesignSpec {
  id: string;
  name: string;
  version: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Design Tokens
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];

  // Components & Patterns
  components: ComponentSpec[];
  patterns: PatternSpec[];
  pages: PageSpec[];

  // Raw content for AI context
  rawContent: string;
}

export interface DesignSpecSummary {
  id: string;
  name: string;
  version: string;
  description?: string;
  updatedAt: string;
  tokenCount: {
    colors: number;
    typography: number;
    spacing: number;
    components: number;
    patterns: number;
    pages: number;
  };
}

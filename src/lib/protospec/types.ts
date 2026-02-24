export const PROTO_SPEC_VERSION = "1.0.0" as const;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ComponentType =
  | "Page"
  | "Container"
  | "Section"
  | "Heading"
  | "Text"
  | "Button"
  | "Input"
  | "Select"
  | "Textarea"
  | "Checkbox"
  | "RadioGroup"
  | "List"
  | "ListItem"
  | "Card"
  | "Image"
  | "Modal"
  | "Custom";

export type InteractionActionType =
  | "set_state"
  | "navigate"
  | "submit_form"
  | "show_message"
  | "toggle_visibility"
  | "custom";

export interface ProtoSpecMeta {
  projectId: string;
  title: string;
  description?: string;
  generatedAt: string;
  sourceHash: string;
  sourceType: "markdown" | "structured";
  compilerVersion: string;
}

export interface ComponentNode {
  id: string;
  type: ComponentType;
  name?: string;
  props: Record<string, JsonValue>;
  children: ComponentNode[];
}

export interface InteractionAction {
  id: string;
  type: InteractionActionType;
  payload: Record<string, JsonValue>;
}

export interface InteractionSpec {
  id: string;
  name: string;
  event: string;
  targetNodeId?: string;
  guard?: string;
  actions: InteractionAction[];
}

export interface PageSpec {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  root: ComponentNode;
  interactions: InteractionSpec[];
  acceptanceCriteria: string[];
}

export interface ColorTokenScale {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  mutedText: string;
  border: string;
}

export interface TypographyTokenScale {
  fontFamily: string;
  fontSizeBase: string;
  fontSizeHeading: string;
  lineHeight: string;
}

export interface SpacingTokenScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface RadiusTokenScale {
  sm: string;
  md: string;
  lg: string;
}

export interface ShadowTokenScale {
  sm: string;
  md: string;
  lg: string;
}

export interface DesignTokens {
  color: ColorTokenScale;
  typography: TypographyTokenScale;
  spacing: SpacingTokenScale;
  radius: RadiusTokenScale;
  shadow: ShadowTokenScale;
}

export interface TraceReference {
  pageId: string;
  nodeId?: string;
  interactionId?: string;
  tokenPath?: string;
}

export interface RequirementTrace {
  requirementId: string;
  text: string;
  references: TraceReference[];
}

export interface QualityReport {
  validationPassed: boolean;
  warningCount: number;
  warnings: string[];
}

export interface ProtoSpec {
  id: string;
  version: typeof PROTO_SPEC_VERSION;
  meta: ProtoSpecMeta;
  pages: PageSpec[];
  tokens: DesignTokens;
  traces: RequirementTrace[];
  quality: QualityReport;
}

export interface ProtoSpecValidationIssue {
  code: string;
  message: string;
  path: string;
}

export interface ProtoSpecValidationResult {
  valid: boolean;
  issues: ProtoSpecValidationIssue[];
}

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  color: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    primary: "#2563EB",
    secondary: "#0EA5E9",
    text: "#0F172A",
    mutedText: "#64748B",
    border: "#CBD5E1",
  },
  typography: {
    fontFamily: "'Geist', 'Helvetica Neue', Arial, sans-serif",
    fontSizeBase: "16px",
    fontSizeHeading: "28px",
    lineHeight: "1.6",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
  },
  shadow: {
    sm: "0 1px 2px rgba(15, 23, 42, 0.08)",
    md: "0 8px 24px rgba(15, 23, 42, 0.12)",
    lg: "0 16px 40px rgba(15, 23, 42, 0.16)",
  },
};

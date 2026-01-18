/**
 * Markdown 设计规范解析器
 */

import type {
  DesignSpec,
  ColorToken,
  TypographyToken,
  SpacingToken,
  ComponentSpec,
  PatternSpec,
  PageSpec,
} from './types';

/**
 * 解析 Markdown 内容为设计规范
 */
export function parseMarkdownSpec(content: string, name: string = 'Untitled'): DesignSpec {
  const now = new Date().toISOString();

  const spec: DesignSpec = {
    id: generateId(),
    name,
    version: '1.0.0',
    description: '',
    createdAt: now,
    updatedAt: now,
    colors: [],
    typography: [],
    spacing: [],
    components: [],
    patterns: [],
    pages: [],
    rawContent: content,
  };

  // 解析 frontmatter
  const frontmatter = parseFrontmatter(content);
  if (frontmatter.name) spec.name = frontmatter.name;
  if (frontmatter.version) spec.version = frontmatter.version;
  if (frontmatter.description) spec.description = frontmatter.description;

  // 分割为章节
  const sections = splitIntoSections(content);

  for (const section of sections) {
    const sectionLower = section.title.toLowerCase();

    if (sectionLower.includes('color') || sectionLower.includes('颜色')) {
      spec.colors.push(...parseColors(section.content));
    } else if (sectionLower.includes('typography') || sectionLower.includes('字体') || sectionLower.includes('排版')) {
      spec.typography.push(...parseTypography(section.content));
    } else if (sectionLower.includes('spacing') || sectionLower.includes('间距')) {
      spec.spacing.push(...parseSpacing(section.content));
    } else if (sectionLower.includes('component') || sectionLower.includes('组件')) {
      spec.components.push(...parseComponents(section.content));
    } else if (sectionLower.includes('pattern') || sectionLower.includes('模式')) {
      spec.patterns.push(...parsePatterns(section.content));
    } else if (sectionLower.includes('page') || sectionLower.includes('页面')) {
      spec.pages.push(...parsePages(section.content));
    }
  }

  return spec;
}

function generateId(): string {
  return `spec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface Section {
  title: string;
  level: number;
  content: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result: Record<string, string> = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      result[key] = value;
    }
  }

  return result;
}

function splitIntoSections(content: string): Section[] {
  const sections: Section[] = [];
  const lines = content.split('\n');

  let currentSection: Section | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // 保存之前的章节
      if (currentSection) {
        currentSection.content = contentLines.join('\n');
        sections.push(currentSection);
      }

      currentSection = {
        title: headingMatch[2],
        level: headingMatch[1].length,
        content: '',
      };
      contentLines = [];
    } else {
      contentLines.push(line);
    }
  }

  // 保存最后一个章节
  if (currentSection) {
    currentSection.content = contentLines.join('\n');
    sections.push(currentSection);
  }

  return sections;
}

function parseColors(content: string): ColorToken[] {
  const colors: ColorToken[] = [];

  // 匹配表格格式: | name | value | description |
  const tableMatch = content.match(/\|[^\n]+\|[\s\S]*?(?=\n\n|\n#|$)/g);
  if (tableMatch) {
    for (const table of tableMatch) {
      const rows = table.split('\n').filter(r => r.trim() && !r.includes('---'));
      const header = rows[0];

      if (!header) continue;

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          const name = cells[0];
          const value = cells[1];
          const description = cells[2] || '';

          if (isColorValue(value)) {
            colors.push({
              name,
              value,
              description,
              category: categorizeColor(name),
            });
          }
        }
      }
    }
  }

  // 匹配列表格式: - name: #value
  const listItems = content.match(/[-*]\s*([^:]+):\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\))/g);
  if (listItems) {
    for (const item of listItems) {
      const match = item.match(/[-*]\s*([^:]+):\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\))/);
      if (match) {
        colors.push({
          name: match[1].trim(),
          value: match[2].trim(),
          category: categorizeColor(match[1]),
        });
      }
    }
  }

  return colors;
}

function isColorValue(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value) ||
         /^rgb[a]?\([^)]+\)$/.test(value) ||
         /^hsl[a]?\([^)]+\)$/.test(value);
}

function categorizeColor(name: string): ColorToken['category'] {
  const lower = name.toLowerCase();
  if (lower.includes('primary')) return 'primary';
  if (lower.includes('secondary')) return 'secondary';
  if (lower.includes('neutral') || lower.includes('gray') || lower.includes('grey')) return 'neutral';
  if (lower.includes('error') || lower.includes('success') || lower.includes('warning') || lower.includes('info')) return 'semantic';
  return 'other';
}

function parseTypography(content: string): TypographyToken[] {
  const typography: TypographyToken[] = [];

  // 匹配表格格式
  const tableMatch = content.match(/\|[^\n]+\|[\s\S]*?(?=\n\n|\n#|$)/g);
  if (tableMatch) {
    for (const table of tableMatch) {
      const rows = table.split('\n').filter(r => r.trim() && !r.includes('---'));

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          typography.push({
            name: cells[0],
            fontSize: cells[1],
            fontWeight: cells[2],
            lineHeight: cells[3],
            description: cells[4],
          });
        }
      }
    }
  }

  return typography;
}

function parseSpacing(content: string): SpacingToken[] {
  const spacing: SpacingToken[] = [];

  // 匹配表格或列表格式
  const tableMatch = content.match(/\|[^\n]+\|[\s\S]*?(?=\n\n|\n#|$)/g);
  if (tableMatch) {
    for (const table of tableMatch) {
      const rows = table.split('\n').filter(r => r.trim() && !r.includes('---'));

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('|').map(c => c.trim()).filter(Boolean);
        if (cells.length >= 2) {
          spacing.push({
            name: cells[0],
            value: cells[1],
            description: cells[2],
          });
        }
      }
    }
  }

  return spacing;
}

function parseComponents(content: string): ComponentSpec[] {
  const components: ComponentSpec[] = [];

  // 解析子章节作为组件
  const sections = splitIntoSections(content);

  for (const section of sections) {
    if (section.level >= 2) {
      const component: ComponentSpec = {
        name: section.title,
        description: extractDescription(section.content),
        variants: extractListItems(section.content, 'variant'),
        examples: extractCodeBlocks(section.content),
      };
      components.push(component);
    }
  }

  // 如果没有子章节，尝试解析列表
  if (components.length === 0) {
    const listItems = content.match(/[-*]\s*\*\*([^*]+)\*\*[:\s]*(.*)/g);
    if (listItems) {
      for (const item of listItems) {
        const match = item.match(/[-*]\s*\*\*([^*]+)\*\*[:\s]*(.*)/);
        if (match) {
          components.push({
            name: match[1].trim(),
            description: match[2].trim(),
          });
        }
      }
    }
  }

  return components;
}

function parsePatterns(content: string): PatternSpec[] {
  const patterns: PatternSpec[] = [];

  const sections = splitIntoSections(content);

  for (const section of sections) {
    if (section.level >= 2) {
      patterns.push({
        name: section.title,
        description: extractDescription(section.content),
        useCase: extractSection(section.content, 'use case') || extractSection(section.content, '使用场景') || '',
        examples: extractCodeBlocks(section.content),
      });
    }
  }

  return patterns;
}

function parsePages(content: string): PageSpec[] {
  const pages: PageSpec[] = [];

  const sections = splitIntoSections(content);

  for (const section of sections) {
    if (section.level >= 2) {
      pages.push({
        name: section.title,
        description: extractDescription(section.content),
        path: extractPath(section.content),
        components: extractListItems(section.content, 'component'),
      });
    }
  }

  return pages;
}

function extractDescription(content: string): string {
  // 取第一段非空文本作为描述
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('|') && !trimmed.startsWith('```')) {
      return trimmed;
    }
  }
  return '';
}

function extractListItems(content: string, type: string): string[] {
  const items: string[] = [];
  const regex = new RegExp(`[-*]\\s*${type}[s]?[:\\s]*(.+)`, 'gi');
  const matches = content.matchAll(regex);

  for (const match of matches) {
    items.push(match[1].trim());
  }

  // 通用列表提取
  if (items.length === 0) {
    const listMatches = content.match(/[-*]\s+([^\n]+)/g);
    if (listMatches) {
      for (const item of listMatches) {
        items.push(item.replace(/^[-*]\s+/, '').trim());
      }
    }
  }

  return items;
}

function extractCodeBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /```[\w]*\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

function extractSection(content: string, keyword: string): string | undefined {
  const regex = new RegExp(`${keyword}[:\\s]*\\n?([^\\n]+)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : undefined;
}

function extractPath(content: string): string | undefined {
  const match = content.match(/path[:\s]+([\/\w-]+)/i) ||
                content.match(/路径[:\s]+([\/\w-]+)/);
  return match ? match[1] : undefined;
}

export { type Section };

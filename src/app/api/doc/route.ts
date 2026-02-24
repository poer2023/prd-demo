import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getDocSource, getProjectNotesDir } from '@/config/doc-sources';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const project = searchParams.get('project');
  const page = searchParams.get('page');

  if (!project || !page) {
    return NextResponse.json({ error: 'Missing project or page parameter' }, { status: 400 });
  }

  // 获取文档来源配置
  const docSource = getDocSource(project, page);

  if (!docSource) {
    // 如果没有配置，尝试从项目笔记目录读取
    const notesDir = getProjectNotesDir(project);
    if (!notesDir) {
      return NextResponse.json({ error: 'Project not found', content: null }, { status: 404 });
    }

    // 尝试多种文件名格式
    const possibleNames = [
      `${page}.md`,
      `_${page}.md`,
      `${page.charAt(0).toUpperCase() + page.slice(1)}.md`,
    ];

    for (const name of possibleNames) {
      try {
        const filePath = path.join(notesDir, name);
        const content = await fs.readFile(filePath, 'utf-8');
        return NextResponse.json({
          content,
          title: page,
          filePath,
        });
      } catch {
        // 继续尝试下一个文件名
      }
    }

    return NextResponse.json({ error: 'Document not found', content: null }, { status: 404 });
  }

  try {
    const content = await fs.readFile(docSource.docPath, 'utf-8');
    return NextResponse.json({
      content,
      title: docSource.title,
      filePath: docSource.docPath,
      prototypeId: docSource.prototypeId,
    });
  } catch {
    return NextResponse.json({
      error: 'Failed to read document',
      content: null,
      filePath: docSource.docPath,
    }, { status: 500 });
  }
}

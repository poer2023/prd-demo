
export const OPTIONS = {
  en: {
    essayTypes: [
      "Essay", "Research Paper", "Case Study", "Coursework", "Term Paper",
      "Dissertation", "Report", "Review", "Speech", "Presentation"
    ],
    academicLevels: [
      "High School", "Undergraduate (Years 1-2)", "Bachelor's",
      "Master's", "Doctoral"
    ],
    wordCounts: [
      "300 words", "500 words", "1000 words", "1600 words",
      "2000 words", "3000 words", "5000+ words"
    ],
    languages: [
      "English(US)", "English(UK)", "Spanish", "French",
      "German", "Chinese (Simplified)", "Portuguese"
    ],
    citationStyles: [
      "APA", "MLA", "Chicago", "Harvard", "IEEE", "Vancouver"
    ]
  },
  zh: {
    essayTypes: [
      "论文 (Essay)", "研究论文 (Research Paper)", "案例研究 (Case Study)", "课程作业 (Coursework)", "学期论文 (Term Paper)",
      "学位论文 (Dissertation)", "报告 (Report)", "评论 (Review)", "演讲稿 (Speech)", "演示文稿 (Presentation)"
    ],
    academicLevels: [
      "高中", "本科 (1-2年级)", "本科 (学士)",
      "硕士", "博士"
    ],
    wordCounts: [
      "300 字", "500 字", "1000 字", "1600 字",
      "2000 字", "3000 字", "5000+ 字"
    ],
    languages: [
      "英语 (美式)", "英语 (英式)", "西班牙语", "法语",
      "德语", "简体中文", "葡萄牙语"
    ],
    citationStyles: [
      "APA", "MLA", "Chicago", "Harvard", "IEEE", "Vancouver"
    ]
  }
};

export const UI_TEXT = {
  en: {
    nav: {
      essayWriter: "AI Essay Writer",
      detector: "AI Detector",
      blog: "Blog",
      history: "History"
    },
    autoFill: {
      title: "AI Smart Analysis",
      subtitle: "Paste or upload assignment requirements to auto-fill the form.",
      placeholder: "Paste prompt/rubric/syllabus to auto-fill the form...",
      uploadTip: "Upload Requirements",
      uploadReq: "Assignment requirements",
      uploadTooltip: "Upload your assignment brief, rubric, or syllabus. We'll auto-fill the form for you. (1 file max)",
      submit: "Analyze",
      reanalyze: "Re-analyze",
      replaceAll: "Replace All",
      fillsHint: "Fills: Type · Level · Topic · Instructions",
      loading: "Analyzing...",
      successTitle: "Filled",
      collapsedMessage: "Analysis complete. Form updated.",
      viewSummary: "View sourcing",
      edit: "Edit",
      sourceLabel: "Source Fragment",
      extractedLabel: "Current Instruction",
      statusLabel: "Status"
    },
    form: {
      typeLabel: "Type",
      levelLabel: "Academic level",
      topicLabel: "Topic or Name",
      topicPlaceholder: "Assignment's topic or name",
      instructionsLabel: "Instructions & Notes",
      reqSectionTitle: "Editor",
      missingHint: "Templates:",
      addConstraints: "Add constraints",
      missingSuggestions: ["Word count", "Citation style", "References", "Deadline"],
      attachRef: "Attach references",
      attachRefTooltip: "Upload academic papers, reading lists, or course materials as references for your essay.",
      refListLabel: "Reference materials",
      refDisclaimer: "For reference only. Won't overwrite instructions.",
      refDisclaimerShort: "Reference only. Won't overwrite.",
      manage: "Manage",
      insertSummary: "Insert summary",
      outlineLabel: "Outline",
      outlineAI: "AI Smart Outline",
      outlineCustom: "Custom Outline",
      wordCountLabel: "Word Count",
      languageLabel: "Language",
      citationLabel: "Citation Style",
      figuresLabel: "Figures & Equations",
      extraCharts: "Include Charts&Tables",
      extraFormulas: "Include Formulas",
      submitButton: "Get My Paper",
      submitLoading: "Writing...",
      resultTitle: "Generated Result"
    },
    order: {
      configTitle: "Essay Configuration",
      untitled: "Untitled Essay",
      edit: "Edit details",
      samplePreviews: "Sample Previews",
      sampleDesc: "See example outputs. Your final files follow your topic & requirements.",
      previewSamples: "Preview samples",
      allInOne: "All-in-one Service",
      corePaper: "1. Core paper",
      reviewUnderstanding: "2. Review & understanding",
      revision: "3. Revision",
      submissionReadyPaper: "Submission-ready paper",
      referenceSources: "Reference sources",
      onePageSummary: "1-page summary",
      topicQA: "Topic Q&A",
      writingStructure: "Writing Structure",
      aiRevisionAgent: "AI revision agent",
      addOnServices: "Add-on Services",
      turnitinTitle: "Turnitin Similarity & AI Report",
      turnitinDesc: "Official PDF report (similarity + AI) delivered with paper.",
      similarityAIReport: "Similarity & AI Report",
      presentationSlides: "Presentation Slides",
      comingSoon: "Soon",
      recommended: "Recommended",
      addonLabel: "Add-on (Turnitin Official Report)",
      total: "Total",
      payButton: "Pay",
      securePayment: "SSL Secure Payment",
      closePreview: "Close Preview",
      samplePreview: "Sample Preview",
      highFidelity: "High-Fidelity Sample",
      samplePlaceholder: "This is a placeholder for the sample. In production, this would display a high-resolution PDF or interactive document viewer to show the quality of output.",
      faq1Title: "Q: Will my EssayPass paper get flagged?",
      faq1Answer: "A: Our engine writes line-by-line using academic logic, unlike standard LLMs. Plus, you can add the official Turnitin report for proof.",
      faq2Title: "Q: Is the draft actually usable?",
      faq2Answer: "A: Yes. You get real citations (matched to text), a clear outline, and a verified reference list. It is a submission-ready artifact.",
      trustedBy: "Trusted by",
      students: "5M+ students",
      gallery: {
        paper: { label: "Paper sample", title: "Submission-ready paper" },
        summary: { label: "Summary sample", title: "1-Page Summary" },
        faq: { label: "FAQ sample", title: "Topic FAQ" },
        strategy: { label: "Logic sample", title: "Writing Strategy" },
        refs: { label: "Sources sample", title: "Reference Full Text" }
      },
      billing: {
        paper: { text: "Submission-ready paper", format: "DOCX/PDF" },
        summary: { text: "1-Page Summary", format: "PDF" },
        faq: { text: "Topic FAQ", format: "PDF" },
        strategy: { text: "Writing Strategy", format: "PDF" },
        refs: { text: "Reference Full Text", format: "ZIP/PDF" },
        agent: { text: "AI Agent Context", format: "Chat Log" }
      },
      previewTitles: {
        paper: "Final Paper Sample",
        summary: "Executive Summary Sample",
        faq: "Topic FAQ & Analysis Sample",
        strategy: "Logic & Strategy Map Sample",
        refs: "Verified References Sample",
        all: "Sample Deliverables Overview"
      } as Record<string, string>
    }
  },
  zh: {
    nav: {
      essayWriter: "AI 论文写作",
      detector: "AI 检测器",
      blog: "博客",
      history: "历史记录"
    },
    autoFill: {
      title: "AI 智能分析",
      subtitle: "粘贴或上传作业要求以自动填充表单。",
      placeholder: "在此粘贴题目/评分标准/大纲以自动填充...",
      uploadTip: "上传要求",
      uploadReq: "作业要求",
      uploadTooltip: "上传老师发布的作业要求、评分标准或教学大纲，AI 将自动填充表单。(限1份)",
      submit: "智能分析",
      reanalyze: "重新分析",
      replaceAll: "覆盖全部",
      fillsHint: "自动填充：类型 · 等级 · 题目 · 说明",
      loading: "分析中...",
      successTitle: "已填充",
      collapsedMessage: "分析完成，表单已更新",
      viewSummary: "查看来源",
      edit: "编辑",
      sourceLabel: "原文片段",
      extractedLabel: "当前说明",
      statusLabel: "状态"
    },
    form: {
      typeLabel: "类型",
      levelLabel: "学术等级",
      topicLabel: "题目或名称",
      topicPlaceholder: "作业的题目或名称",
      instructionsLabel: "写作说明与备注",
      reqSectionTitle: "编辑器",
      missingHint: "插入模板:",
      addConstraints: "添加限制条件",
      missingSuggestions: ["字数要求", "引用格式", "参考文献", "截止日期"],
      attachRef: "添加参考资料",
      attachRefTooltip: "上传学术论文、老师提供的阅读清单或课程资料，作为写作参考。",
      refListLabel: "参考资料",
      refDisclaimer: "仅供写作参考，不会覆盖下方说明。",
      refDisclaimerShort: "仅供参考，不覆盖说明。",
      manage: "管理",
      insertSummary: "插入摘要",
      outlineLabel: "大纲",
      outlineAI: "AI 智能大纲",
      outlineCustom: "自定义大纲",
      wordCountLabel: "字数",
      languageLabel: "语言",
      citationLabel: "引用格式",
      figuresLabel: "图表与公式",
      extraCharts: "包含图表",
      extraFormulas: "包含公式",
      submitButton: "生成我的论文",
      submitLoading: "正在写作...",
      resultTitle: "生成结果"
    },
    order: {
      configTitle: "论文配置",
      untitled: "未命名论文",
      edit: "编辑详情",
      samplePreviews: "样例预览",
      sampleDesc: "查看示例输出。最终文件将按照您的主题和要求生成。",
      previewSamples: "预览样例",
      allInOne: "一站式服务",
      corePaper: "1. 核心论文",
      reviewUnderstanding: "2. 复习与理解",
      revision: "3. 修订",
      submissionReadyPaper: "可提交的论文",
      referenceSources: "参考文献来源",
      onePageSummary: "一页摘要",
      topicQA: "主题问答",
      writingStructure: "写作结构",
      aiRevisionAgent: "AI修订助手",
      addOnServices: "附加服务",
      turnitinTitle: "Turnitin 查重 & AI 检测报告",
      turnitinDesc: "官方 PDF 报告（查重率 + AI 检测）随论文交付。",
      similarityAIReport: "查重 & AI 检测报告",
      presentationSlides: "演示文稿",
      comingSoon: "即将上线",
      recommended: "推荐",
      addonLabel: "附加服务 (Turnitin 官方报告)",
      total: "总计",
      payButton: "支付",
      securePayment: "SSL 安全支付",
      closePreview: "关闭预览",
      samplePreview: "样例预览",
      highFidelity: "高保真样例",
      samplePlaceholder: "这是样例的占位符。在生产环境中，这将显示高分辨率 PDF 或交互式文档查看器以展示输出质量。",
      faq1Title: "问：EssayPass 的论文会被检测出来吗？",
      faq1Answer: "答：我们的引擎使用学术逻辑逐行写作，不同于标准 LLM。此外，您可以添加官方 Turnitin 报告作为证明。",
      faq2Title: "问：生成的草稿真的能用吗？",
      faq2Answer: "答：是的。您将获得真实的引用（与正文匹配）、清晰的大纲和经过验证的参考文献列表。这是可直接提交的成品。",
      trustedBy: "已获信赖",
      students: "500万+ 学生",
      gallery: {
        paper: { label: "论文样例", title: "可提交的论文" },
        summary: { label: "摘要样例", title: "一页摘要" },
        faq: { label: "FAQ样例", title: "主题常见问题" },
        strategy: { label: "逻辑样例", title: "写作策略" },
        refs: { label: "文献样例", title: "参考文献全文" }
      },
      billing: {
        paper: { text: "可提交的论文", format: "DOCX/PDF" },
        summary: { text: "一页摘要", format: "PDF" },
        faq: { text: "主题常见问题", format: "PDF" },
        strategy: { text: "写作策略", format: "PDF" },
        refs: { text: "参考文献全文", format: "ZIP/PDF" },
        agent: { text: "AI 代理上下文", format: "聊天记录" }
      },
      previewTitles: {
        paper: "最终论文样例",
        summary: "执行摘要样例",
        faq: "主题 FAQ 与分析样例",
        strategy: "逻辑与策略图样例",
        refs: "已验证参考文献样例",
        all: "交付物概览样例"
      } as Record<string, string>
    }
  }
};

export const ESSAY_TYPES = OPTIONS.en.essayTypes;
export const ACADEMIC_LEVELS = OPTIONS.en.academicLevels;
export const WORD_COUNTS = OPTIONS.en.wordCounts;
export const LANGUAGES = OPTIONS.en.languages;
export const CITATION_STYLES = OPTIONS.en.citationStyles;

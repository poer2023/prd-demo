'use client';

import { useState, useRef, useEffect } from 'react';
import { Select, Input, RadioCard, CheckboxCard, Label } from './ui/FormComponents';
import { EssayFormData, Lang } from './types';
import { OPTIONS, UI_TEXT } from './constants';

interface EssayFormProps {
    lang: Lang;
    onSubmit: (formData: EssayFormData) => void;
}

export default function EssayForm({ lang, onSubmit }: EssayFormProps) {
    const options = OPTIONS[lang];
    const t = UI_TEXT[lang];

    const ESSAY_TYPES = options.essayTypes.map(label => ({ value: label, label }));
    const ACADEMIC_LEVELS = options.academicLevels.map(label => ({ value: label, label }));
    const WORD_COUNTS = options.wordCounts.map(label => ({ value: label, label }));
    const LANGUAGES = options.languages.map(label => ({ value: label, label }));
    const CITATION_STYLES = options.citationStyles.map(label => ({ value: label, label }));

    const [formData, setFormData] = useState<EssayFormData>({
        type: ESSAY_TYPES[0].value,
        academicLevel: ACADEMIC_LEVELS[2].value,
        topic: '',
        instructions: '',
        referenceFiles: [],
        outlineType: 'ai',
        wordCount: WORD_COUNTS[3].value,
        language: LANGUAGES[0].value,
        citationStyle: CITATION_STYLES[0].value,
        includeChartsTables: false,
        includeFormulas: false,
    });

    const [autoFillPrompt, setAutoFillPrompt] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [filledFields, setFilledFields] = useState<Set<string>>(new Set());
    const [highlightedField, setHighlightedField] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoFocused, setIsAutoFocused] = useState(true);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fieldRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (textareaRef.current && !isCollapsed) {
            textareaRef.current.focus();
        }
        const timer = setTimeout(() => {
            setIsAutoFocused(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, [isCollapsed]);

    const handleChange = (field: keyof EssayFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (value) {
            setFilledFields(prev => new Set(prev).add(field));
        }
    };

    const handleAutoFillInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAutoFillPrompt(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleAnalyze = async () => {
        if (!autoFillPrompt.trim()) return;
        setIsAnalyzing(true);
        setFilledFields(new Set());

        const demoData = {
            type: ESSAY_TYPES[0].value,
            academicLevel: ACADEMIC_LEVELS[2].value,
            topic: lang === 'zh' ? '人工智能对现代教育的影响' : 'The Impact of Artificial Intelligence on Modern Education',
            instructions: lang === 'zh'
                ? '### 任务目标\n- 讨论ChatGPT等AI工具在课堂中的优缺点\n- 包含伦理考量\n\n### 限制条件\n- 使用学术语气\n- 引用所有来源'
                : '### Task Objectives\n- Discuss the pros and cons of AI tools like ChatGPT in classrooms\n- Include ethical considerations\n\n### Constraints\n- Use academic tone\n- Cite all sources',
            wordCount: WORD_COUNTS[4].value,
        };

        const sequence = [
            { field: 'type', value: demoData.type },
            { field: 'academicLevel', value: demoData.academicLevel },
            { field: 'topic', value: demoData.topic },
            { field: 'instructions', value: demoData.instructions },
            { field: 'wordCount', value: demoData.wordCount },
        ];

        try {
            await new Promise(r => setTimeout(r, 800));

            for (const step of sequence) {
                setHighlightedField(step.field);
                await new Promise(r => setTimeout(r, 300));
                setFormData(prev => ({ ...prev, [step.field]: step.value }));
                await new Promise(r => setTimeout(r, 200));
                setFilledFields(prev => new Set(prev).add(step.field));
                await new Promise(r => setTimeout(r, 100));
            }

            setHighlightedField(null);
            setIsCollapsed(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.topic) {
            alert(lang === 'zh' ? '请输入主题' : 'Please enter a topic');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            onSubmit(formData);
            setIsSubmitting(false);
        }, 500);
    };

    return (
        <div className="pt-4 pb-8 px-4">
            <div className="max-w-4xl mx-auto animate-fade-in-up">

                {/* ========== OPTION A: AI AUTO-FILL ========== */}
                <div className={isCollapsed ? 'mb-0' : 'mb-2'}>
                    {isCollapsed ? (
                        <div className="bg-slate-600 rounded-t-2xl rounded-b-none px-6 py-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white animate-fade-in-up">
                                <div className="flex items-center gap-3 font-medium text-sm flex-1">
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <span className="truncate opacity-90">{t.autoFill.collapsedMessage}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button
                                        onClick={() => { setIsCollapsed(false); handleAnalyze(); }}
                                        className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded hover:bg-slate-500 transition-colors"
                                    >
                                        {t.autoFill.reanalyze}
                                    </button>
                                    <div className="h-4 w-px bg-slate-500"></div>
                                    <button
                                        onClick={() => setIsCollapsed(false)}
                                        className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
                                    >
                                        {t.autoFill.edit}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 px-1 mb-2">
                                <span className="bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">Option A</span>
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t.autoFill.title}</h3>
                            </div>
                            <div className="relative group text-left">
                                <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur-md transition-all duration-500 ${isAutoFocused || isAnalyzing ? 'opacity-50 animate-gradient-x' : 'opacity-0 group-focus-within:opacity-50 group-focus-within:animate-gradient-x'}`}></div>
                                <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-end">
                                        <textarea
                                            ref={textareaRef}
                                            rows={2}
                                            className="flex-1 p-3 pl-4 min-h-[56px] max-h-40 resize-none outline-none text-slate-700 placeholder:text-slate-400 text-sm leading-relaxed bg-transparent overflow-y-auto rounded-xl sm:rounded-l-xl sm:rounded-r-none"
                                            placeholder={t.autoFill.placeholder}
                                            value={autoFillPrompt}
                                            onChange={handleAutoFillInput}
                                            disabled={isAnalyzing}
                                        />
                                        <div className="flex items-center justify-end gap-2 px-3 pb-3 sm:pb-2.5 sm:pr-3 sm:pl-0">
                                            <button
                                                type="button"
                                                onClick={handleAnalyze}
                                                disabled={isAnalyzing || !autoFillPrompt.trim()}
                                                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg shadow transition-all overflow-hidden ${
                                                    (isAnalyzing || !autoFillPrompt.trim())
                                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-gradient-x text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105'
                                                }`}
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        <span className="text-xs font-semibold relative z-10">{t.autoFill.loading}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        <span className="text-xs font-semibold relative z-10">{t.autoFill.submit}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ========== OR DIVIDER ========== */}
                <div className={`transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 my-0' : 'max-h-8 opacity-100 my-2'}`}>
                    <div className="relative flex items-center justify-center">
                        <span className="text-slate-400 text-sm font-bold tracking-wider uppercase">OR</span>
                    </div>
                </div>

                {/* ========== OPTION B: FILL MANUALLY ========== */}
                <div>
                    <div className={`transition-all duration-500 overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-16 opacity-100 mb-3'}`}>
                        <div className="flex items-center gap-2 px-1">
                            <span className="bg-slate-700 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">Option B</span>
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{t.form.instructionsLabel}</h3>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className={`bg-white overflow-hidden p-6 sm:p-8 space-y-5 transition-all duration-500 ${isCollapsed
                                ? 'rounded-b-2xl rounded-t-none shadow-xl shadow-slate-200/60 border border-slate-200 border-t-0'
                                : 'rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200'
                            }`}
                    >
                        {/* Type & Academic Level */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div
                                ref={el => { fieldRefs.current['type'] = el; }}
                                className={`transition-all duration-300 rounded-lg p-1 -m-1 ${highlightedField === 'type' ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 scale-[1.02]' : ''}`}
                            >
                                <Select
                                    label={t.form.typeLabel}
                                    required
                                    options={ESSAY_TYPES}
                                    value={formData.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                    isFilled={filledFields.has('type')}
                                />
                            </div>
                            <div
                                ref={el => { fieldRefs.current['academicLevel'] = el; }}
                                className={`transition-all duration-300 rounded-lg p-1 -m-1 ${highlightedField === 'academicLevel' ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 scale-[1.02]' : ''}`}
                            >
                                <Select
                                    label={t.form.levelLabel}
                                    required
                                    options={ACADEMIC_LEVELS}
                                    value={formData.academicLevel}
                                    onChange={(e) => handleChange('academicLevel', e.target.value)}
                                    isFilled={filledFields.has('academicLevel')}
                                />
                            </div>
                        </div>

                        {/* Topic */}
                        <div
                            ref={el => { fieldRefs.current['topic'] = el; }}
                            className={`transition-all duration-300 rounded-lg p-1 -m-1 ${highlightedField === 'topic' ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 scale-[1.02]' : ''}`}
                        >
                            <Input
                                label={t.form.topicLabel}
                                required
                                placeholder={t.form.topicPlaceholder}
                                value={formData.topic}
                                onChange={(e) => handleChange('topic', e.target.value)}
                                isFilled={filledFields.has('topic')}
                            />
                        </div>

                        {/* Instructions & Notes */}
                        <div
                            ref={el => { fieldRefs.current['instructions'] = el; }}
                            className={`mt-6 transition-all duration-300 rounded-xl border border-slate-200 bg-white overflow-visible shadow-sm ${highlightedField === 'instructions' ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 scale-[1.01]' : ''}`}
                        >
                            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between min-h-[44px]">
                                <Label className="mb-0 font-semibold" isFilled={filledFields.has('instructions')}>{t.form.instructionsLabel}</Label>
                            </div>
                            <div className="p-0">
                                <textarea
                                    rows={4}
                                    value={formData.instructions}
                                    onChange={(e) => handleChange('instructions', e.target.value)}
                                    className={`w-full p-4 min-h-[120px] text-slate-700 text-sm leading-relaxed resize-y focus:ring-0 border-none outline-none placeholder:text-slate-400 ${filledFields.has('instructions') ? 'bg-emerald-50/20' : 'bg-transparent'}`}
                                    placeholder={lang === 'zh' ? '在此粘贴具体说明、题目详情、评分标准...' : 'Paste specific instructions, prompt details, grading criteria here...'}
                                />
                            </div>
                        </div>

                        {/* Outline */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-3">
                                <Label>{t.form.outlineLabel}</Label>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <RadioCard
                                    label={t.form.outlineAI}
                                    name="outline"
                                    value="ai"
                                    checked={formData.outlineType === 'ai'}
                                    onChange={() => handleChange('outlineType', 'ai')}
                                />
                                <RadioCard
                                    label={t.form.outlineCustom}
                                    name="outline"
                                    value="custom"
                                    checked={formData.outlineType === 'custom'}
                                    onChange={() => handleChange('outlineType', 'custom')}
                                />
                            </div>
                        </div>

                        {/* Word Count, Language, Citation Style */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div
                                ref={el => { fieldRefs.current['wordCount'] = el; }}
                                className={`transition-all duration-300 rounded-lg p-1 -m-1 ${highlightedField === 'wordCount' ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 scale-[1.02]' : ''}`}
                            >
                                <Select
                                    label={t.form.wordCountLabel}
                                    required
                                    options={WORD_COUNTS}
                                    value={formData.wordCount}
                                    onChange={(e) => handleChange('wordCount', e.target.value)}
                                    isFilled={filledFields.has('wordCount')}
                                />
                            </div>
                            <Select
                                label={t.form.languageLabel}
                                required
                                options={LANGUAGES}
                                value={formData.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                isFilled={filledFields.has('language')}
                            />
                            <Select
                                label={t.form.citationLabel}
                                options={CITATION_STYLES}
                                value={formData.citationStyle}
                                onChange={(e) => handleChange('citationStyle', e.target.value)}
                                isFilled={filledFields.has('citationStyle')}
                            />
                        </div>

                        {/* Figures & Equations */}
                        <div>
                            <Label>{t.form.figuresLabel}</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <CheckboxCard
                                    label={t.form.extraCharts}
                                    checked={formData.includeChartsTables}
                                    onChange={(checked) => handleChange('includeChartsTables', checked)}
                                />
                                <CheckboxCard
                                    label={t.form.extraFormulas}
                                    checked={formData.includeFormulas}
                                    onChange={(checked) => handleChange('includeFormulas', checked)}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-center">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="
                                    w-full sm:w-auto min-w-[300px]
                                    bg-orange-500 hover:bg-orange-600
                                    text-white text-lg font-bold
                                    py-4 px-8 rounded-full
                                    shadow-lg shadow-orange-500/20
                                    transition-all duration-200
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                    hover:shadow-xl hover:-translate-y-0.5
                                    active:translate-y-0 active:shadow-lg
                                "
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t.form.submitLoading}
                                    </span>
                                ) : (
                                    t.form.submitButton
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

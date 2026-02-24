'use client';

import React, { useState } from 'react';
import { EssayFormData, Lang } from '@/lib/essaypass-types';
import { UI_TEXT } from '@/lib/essaypass-constants';

/**
 * EssayPass 待支付页原型
 * 复用自 /Users/wanghao/Project/EssayPass/essaypass-next
 */

// 模拟的订单数据
const mockOrderData: EssayFormData = {
    type: 'Research Paper',
    academicLevel: "Master's",
    topic: 'The Impact of AI on Modern Education Systems',
    instructions: 'Focus on K-12 education, include case studies from at least 3 countries',
    referenceFiles: [],
    outlineType: 'ai',
    wordCount: '3000 words',
    language: 'English(US)',
    citationStyle: 'APA',
    includeChartsTables: true,
    includeFormulas: false,
};

// Preview Modal Component
const PreviewModal = ({
    activeItem,
    onClose,
    lang
}: {
    activeItem: string | null;
    onClose: () => void;
    lang: Lang;
}) => {
    if (!activeItem) return null;

    const t = UI_TEXT[lang].order;
    const titleMap = t.previewTitles as Record<string, string>;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl p-0 relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="text-xl">📄</span>
                        {titleMap[activeItem] || t.samplePreview}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto bg-slate-50/30">
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <h4 className="text-slate-900 font-bold mb-2">{t.highFidelity}</h4>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                            {t.samplePlaceholder}
                        </p>
                        <div className="w-full max-w-md space-y-3 opacity-50 blur-[1px]">
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-white">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                        {t.closePreview}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Card Visual Renderer
const renderCardVisual = (id: string) => {
    switch (id) {
        case 'paper':
            return (
                <div className="w-full h-full bg-white relative flex flex-col p-2.5 overflow-hidden">
                    <div className="text-[7px] font-bold text-slate-800 text-center mb-0.5 leading-tight">The Impact of AI on</div>
                    <div className="text-[7px] font-bold text-slate-800 text-center mb-1 leading-tight">Education</div>
                    <div className="text-[5px] text-slate-400 text-center mb-1.5 italic">Author • University</div>
                    <div className="text-[6px] font-bold text-slate-700 mb-0.5">Abstract</div>
                    <div className="space-y-[2px] mb-1.5">
                        <div className="h-[2px] w-full bg-slate-300 rounded-full"></div>
                        <div className="h-[2px] w-full bg-slate-300 rounded-full"></div>
                        <div className="h-[2px] w-3/4 bg-slate-300 rounded-full"></div>
                    </div>
                    <div className="text-[6px] font-bold text-slate-700 mb-0.5">1. Introduction</div>
                    <div className="space-y-[2px] flex-1">
                        <div className="h-[2px] w-full bg-slate-200 rounded-full"></div>
                        <div className="h-[2px] w-full bg-slate-200 rounded-full"></div>
                        <div className="h-[2px] w-5/6 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="text-[5px] text-slate-400 text-center mt-1">— 1 —</div>
                </div>
            );
        case 'refs':
            return (
                <div className="w-full h-full bg-white relative flex flex-col p-2.5 overflow-hidden">
                    <div className="text-[7px] font-bold text-slate-800 mb-1.5 pb-1 border-b border-slate-200 text-center">References</div>
                    <div className="space-y-1.5 flex-1 text-[5px]">
                        <div className="flex items-start gap-1">
                            <span className="text-emerald-600 font-medium shrink-0">Smith, J.</span>
                            <span className="text-slate-400">(2024).</span>
                            <div className="h-[2px] flex-1 bg-slate-200 rounded-full mt-1"></div>
                        </div>
                        <div className="flex items-start gap-1">
                            <span className="text-emerald-600 font-medium shrink-0">Brown, A.</span>
                            <span className="text-slate-400">(2023).</span>
                            <div className="h-[2px] flex-1 bg-slate-200 rounded-full mt-1"></div>
                        </div>
                        <div className="flex items-start gap-1">
                            <span className="text-emerald-600 font-medium shrink-0">Lee, M.</span>
                            <span className="text-slate-400">(2024).</span>
                            <div className="h-[2px] flex-1 bg-slate-200 rounded-full mt-1"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-0.5 mt-1">
                        <svg className="w-2.5 h-2.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span className="text-[5px] text-emerald-500 font-medium">Verified</span>
                    </div>
                </div>
            );
        case 'summary':
            return (
                <div className="w-full h-full bg-gradient-to-b from-rose-50 to-white relative flex flex-col p-2.5 overflow-hidden">
                    <div className="text-[7px] font-bold text-rose-600 mb-1.5 pb-1 border-b border-rose-200">Executive Summary</div>
                    <div className="space-y-1.5 flex-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-start gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5 shrink-0"></div>
                                <div className={`h-[2px] bg-slate-300 rounded-full mt-1 ${i === 2 ? 'w-5/6' : i === 4 ? 'w-4/5' : 'w-full'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'agent':
            return (
                <div className="w-full h-full bg-gradient-to-b from-indigo-50 to-white relative flex flex-col p-2.5 overflow-hidden">
                    <div className="flex items-center gap-1 mb-1.5 pb-1 border-b border-indigo-200">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" /></svg>
                        </div>
                        <span className="text-[6px] font-bold text-indigo-600">AI Assistant</span>
                    </div>
                    <div className="space-y-1 flex-1">
                        <div className="flex justify-end">
                            <div className="bg-indigo-500 text-white rounded-lg px-1.5 py-0.5 max-w-[75%]">
                                <div className="text-[4px]">Help me revise...</div>
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-slate-100 rounded-lg px-1.5 py-0.5 max-w-[75%]">
                                <div className="text-[4px] text-slate-600">Sure! Here&apos;s my suggestion...</div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-indigo-500 text-white rounded-lg px-1.5 py-0.5 max-w-[75%]">
                                <div className="text-[4px]">Thanks!</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

export default function OrderConfirmationPage() {
    const [lang] = useState<Lang>('en');
    const [isTurnitinChecked, setIsTurnitinChecked] = useState(false);
    const [activePreview, setActivePreview] = useState<string | null>(null);

    const t = UI_TEXT[lang].order;
    const formData = mockOrderData;

    // Pricing Logic
    const BASE_PRICE = 9.99;
    const BASE_ORIGINAL = 40.00;
    const ADDON_PRICE = 4.99;
    const ADDON_ORIGINAL_VALUE = 9.99;

    const totalPrice = (BASE_PRICE + (isTurnitinChecked ? ADDON_PRICE : 0)).toFixed(2);
    const totalOriginal = (BASE_ORIGINAL + (isTurnitinChecked ? ADDON_ORIGINAL_VALUE : 0)).toFixed(2);

    return (
        <>
            <PreviewModal
                activeItem={activePreview}
                onClose={() => setActivePreview(null)}
                lang={lang}
            />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-6xl mx-auto font-sans animate-fade-in-up pb-52 sm:pb-10 p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start">

                        {/* LEFT COLUMN: Main Order Card */}
                        <div className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-5 sm:px-8 sm:py-6 relative overflow-visible">

                            {/* Header */}
                            <div className="mb-6 border-b border-slate-50 pb-4">
                                <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{formData.topic || t.untitled}</h2>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="px-2.5 py-0.5 rounded border border-slate-100 text-[11px] font-medium text-slate-500 bg-slate-50">{formData.type}</span>
                                    <span className="px-2.5 py-0.5 rounded border border-slate-100 text-[11px] font-medium text-slate-500 bg-slate-50">{formData.wordCount}</span>
                                    <span className="px-2.5 py-0.5 rounded border border-slate-100 text-[11px] font-medium text-slate-500 bg-slate-50">{formData.citationStyle}</span>
                                </div>
                            </div>

                            {/* SECTION: ALL-IN-ONE SERVICE */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-slate-900 italic">{t.allInOne}</h3>
                                </div>

                                <div className="flex flex-col lg:flex-row gap-4 lg:gap-3 items-stretch">
                                    {/* Column 1: Core paper */}
                                    <div className="lg:flex-[2] min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3">1. Core paper</h4>
                                        <div className="border border-slate-200 rounded-2xl p-4 bg-white lg:h-[180px] flex items-center justify-center">
                                            <div className="grid grid-cols-2 gap-4 w-full lg:flex lg:justify-around">
                                                {/* Submission-ready paper */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        onClick={() => setActivePreview('paper')}
                                                        className="w-[100px] h-[100px] bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                                                    >
                                                        <div className="w-full h-full rounded-lg overflow-hidden border border-slate-50">
                                                            {renderCardVisual('paper')}
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 h-10 flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-slate-700 leading-tight text-center">Submission-ready paper</span>
                                                    </div>
                                                </div>

                                                {/* Reference sources */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        onClick={() => setActivePreview('refs')}
                                                        className="w-[100px] h-[100px] bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                                                    >
                                                        <div className="w-full h-full rounded-lg overflow-hidden border border-slate-50">
                                                            {renderCardVisual('refs')}
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                                <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 h-10 flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-slate-700 leading-tight text-center">Reference sources</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Review & understanding */}
                                    <div className="lg:flex-[2] min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3">2. Review & understanding</h4>
                                        <div className="border border-slate-200 rounded-2xl p-4 bg-white lg:h-[180px] flex items-center justify-center">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    onClick={() => setActivePreview('summary')}
                                                    className="w-[100px] h-[100px] bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                                                >
                                                    <div className="w-full h-full rounded-lg overflow-hidden border border-slate-50">
                                                        {renderCardVisual('summary')}
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 h-10 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-slate-700 leading-tight text-center">1-page summary</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Revision */}
                                    <div className="lg:flex-[1] min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 mb-3">3. Revision</h4>
                                        <div className="border border-slate-200 rounded-2xl p-4 bg-white lg:h-[180px] flex items-center justify-center">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    onClick={() => setActivePreview('agent')}
                                                    className="w-[100px] h-[100px] bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
                                                >
                                                    <div className="w-full h-full rounded-lg overflow-hidden border border-slate-50">
                                                        {renderCardVisual('agent')}
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                                                            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 h-10 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-slate-700 leading-tight text-center">AI revision agent</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Turnitin Add-on */}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 italic mb-4">Add-on Services</h3>
                                <div
                                    onClick={() => setIsTurnitinChecked(!isTurnitinChecked)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${isTurnitinChecked ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isTurnitinChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                {isTurnitinChecked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                            </div>
                                            <span className="font-semibold text-slate-700">Turnitin Similarity & AI Report</span>
                                        </div>
                                        <span className="font-bold text-slate-900">+$4.99</span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Price Summary */}
                            <div className="hidden sm:block border-t border-slate-100 pt-4">
                                <div className="flex justify-between text-sm text-slate-500 mb-2">
                                    <span>{t.allInOne}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="line-through text-slate-300">${BASE_ORIGINAL.toFixed(2)}</span>
                                        <span>${BASE_PRICE.toFixed(2)}</span>
                                    </div>
                                </div>
                                {isTurnitinChecked && (
                                    <div className="flex justify-between text-sm text-slate-500 mb-2 animate-fade-in-up">
                                        <span>{t.addonLabel}</span>
                                        <span>+${ADDON_PRICE.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/60">
                                    <span className="text-base font-bold text-slate-900">{t.total}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 line-through text-xs font-medium">${totalOriginal}</span>
                                        <span className="text-3xl font-bold text-slate-900 tracking-tight">${totalPrice}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-gradient-to-r from-[#5046e5] to-[#8b5cf6] hover:from-[#4338ca] hover:to-[#7c3aed] text-white text-lg font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                                    <span>{t.payButton} ${totalPrice}</span>
                                    <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </button>
                                <div className="flex justify-center items-center gap-1.5 mt-3 opacity-60 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    {t.securePayment}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FAQ Sidebar */}
                        <div className="w-full lg:w-[300px] flex-col gap-3 hidden lg:flex sticky top-24">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{t.faq1Title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{t.faq1Answer}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{t.faq2Title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{t.faq2Answer}</p>
                            </div>
                            <div className="mt-2 px-1 flex items-center justify-start gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#F3F7FC] bg-slate-200 overflow-hidden relative">
                                            <img src={`https://i.pravatar.cc/100?img=${i + 25}`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-[10px] text-slate-600 font-medium leading-tight">
                                    {t.trustedBy} <br /><span className="font-bold text-blue-600 text-xs">{t.students}</span>.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Fixed Bottom Pay Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 pt-3 pb-4 sm:hidden z-50 shadow-lg shadow-slate-900/10">
                    <div className="flex flex-col gap-1 mb-3">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{t.allInOne}</span>
                            <div className="flex items-center gap-2">
                                <span className="line-through text-slate-300">${BASE_ORIGINAL.toFixed(2)}</span>
                                <span>${BASE_PRICE.toFixed(2)}</span>
                            </div>
                        </div>
                        {isTurnitinChecked && (
                            <div className="flex justify-between text-xs text-slate-500 animate-fade-in-up">
                                <span>{t.addonLabel}</span>
                                <span>+${ADDON_PRICE.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                            <span className="text-sm font-bold text-slate-900">{t.total}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 line-through text-xs">${totalOriginal}</span>
                                <span className="text-2xl font-bold text-slate-900">${totalPrice}</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-[#5046e5] to-[#8b5cf6] hover:from-[#4338ca] hover:to-[#7c3aed] text-white text-lg font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                        <span>{t.payButton} ${totalPrice}</span>
                        <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </button>
                    <div className="flex justify-center items-center gap-1.5 mt-2 opacity-60 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {t.securePayment}
                    </div>
                </div>
            </div>
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Lang } from '@/lib/essaypass-types';

interface FeatureCarouselProps {
  lang: Lang;
}

const FEATURES = {
  en: [
    {
      id: 1,
      titleBlue: 'Zero',
      titleDash: ' - ',
      titleBlack: 'Risk',
      subtitle: 'AI Detection',
      bullets: [
        'Tested against Turnitin & GPTZero',
        'Average AI score below 0.1%'
      ]
    },
    {
      id: 2,
      titleBlue: 'Academic',
      titleDash: '',
      titleBlack: '',
      subtitle: 'Format',
      bullets: [
        'APA / MLA / Harvard supported',
        'Ready-to-submit paper structure'
      ]
    },
    {
      id: 3,
      titleBlue: 'Real',
      titleDash: '',
      titleBlack: '',
      subtitle: 'References',
      bullets: [
        'Cited from real academic databases',
        'Fully traceable references (DOI)'
      ]
    }
  ],
  zh: [
    {
      id: 1,
      titleBlue: '零',
      titleDash: '',
      titleBlack: '风险',
      subtitle: 'AI 检测',
      bullets: [
        '经 Turnitin 和 GPTZero 测试',
        '平均 AI 评分低于 0.1%'
      ]
    },
    {
      id: 2,
      titleBlue: '学术',
      titleDash: '',
      titleBlack: '',
      subtitle: '格式规范',
      bullets: [
        '支持 APA / MLA / Harvard 格式',
        '可直接提交的论文结构'
      ]
    },
    {
      id: 3,
      titleBlue: '真实',
      titleDash: '',
      titleBlack: '',
      subtitle: '参考文献',
      bullets: [
        '引用自真实学术数据库',
        '完全可追溯的引用 (DOI)'
      ]
    }
  ]
};

// Card 1: Zero-Risk AI Detection Mockup
const AIDetectionMockup = () => (
  <div className="w-full h-full bg-white rounded-lg flex flex-col p-3 text-left">
    {/* Header Badge */}
    <div className="flex justify-center mb-3">
      <div className="px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
        <span className="text-[8px] font-medium text-slate-500 uppercase tracking-wider">Safe for Academic Submission</span>
      </div>
    </div>

    {/* Detection Results Row */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      {/* Turnitin */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
        <div className="text-[8px] text-slate-400 uppercase tracking-wider mb-1">Turnitin</div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-600 font-bold text-[11px]">PASSED</span>
          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      {/* GPTZero */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
        <div className="text-[8px] text-slate-400 uppercase tracking-wider mb-1">GPTZero</div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-600 font-bold text-[11px]">HUMAN-LIKE</span>
          <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
        </div>
      </div>
    </div>

    {/* Pass Rate Section */}
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
      <div>
        <div className="text-xl font-bold text-slate-900">100%</div>
        <div className="text-[9px] text-slate-400">Pass Rate</div>
      </div>
      {/* Bar Chart */}
      <div className="flex items-end gap-[3px] h-8">
        <div className="w-[6px] h-2 bg-emerald-200 rounded-sm"></div>
        <div className="w-[6px] h-3 bg-emerald-300 rounded-sm"></div>
        <div className="w-[6px] h-4 bg-emerald-400 rounded-sm"></div>
        <div className="w-[6px] h-5 bg-emerald-500 rounded-sm"></div>
        <div className="w-[6px] h-7 bg-emerald-600 rounded-sm"></div>
      </div>
    </div>
  </div>
);

// Card 2: Academic Format Mockup
const AcademicFormatMockup = () => (
  <div className="w-full h-full bg-white rounded-lg flex flex-col p-3">
    {/* Format Options */}
    <div className="flex flex-col gap-2 mb-2">
      {/* APA - Selected */}
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg px-3 py-1.5">
        <span className="text-[10px] font-semibold text-blue-600">APA 7th Edition</span>
      </div>
      {/* MLA */}
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5">
        <span className="text-[10px] font-medium text-slate-500">MLA 9th Edition</span>
      </div>
      {/* Harvard */}
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5">
        <span className="text-[10px] font-medium text-slate-500">Harvard</span>
      </div>
    </div>

    {/* Document Preview */}
    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 relative">
      {/* Document lines */}
      <div className="space-y-1.5">
        <div className="h-1 w-16 bg-slate-300 rounded"></div>
        <div className="h-1 w-full bg-slate-200 rounded"></div>
        <div className="h-1 w-full bg-slate-200 rounded"></div>
        <div className="h-1 w-3/4 bg-slate-200 rounded"></div>
        <div className="h-1 w-full bg-slate-200 rounded"></div>
        <div className="h-1 w-2/3 bg-slate-200 rounded"></div>
      </div>
      {/* Page indicator */}
      <div className="absolute bottom-1 right-2 text-[7px] text-slate-300">Page 1 of 12</div>
    </div>

    {/* Download Button */}
    <div className="mt-2">
      <button className="w-full bg-slate-900 text-white rounded-lg px-3 py-2 text-[9px] font-semibold flex items-center justify-center gap-1.5">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        DOWNLOAD DOCX
      </button>
    </div>
  </div>
);

// Card 3: Real References Mockup
const ReferencesMockup = () => (
  <div className="w-full h-full bg-white rounded-lg flex p-3 gap-3">
    {/* Left Column - Databases */}
    <div className="w-16 flex flex-col">
      <div className="text-[7px] font-medium text-slate-400 uppercase tracking-wider mb-2">Databases</div>
      <div className="space-y-1.5">
        {/* JSTOR - Connected */}
        <div className="bg-orange-50 border border-orange-200 rounded px-1.5 py-1 flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <div className="flex flex-col">
            <span className="text-[7px] font-semibold text-orange-700">JSTOR</span>
            <span className="text-[5px] text-orange-500">Connected</span>
          </div>
        </div>
        {/* Google Scholar */}
        <div className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1">
          <span className="text-[7px] font-medium text-slate-500">Google</span>
          <div className="text-[7px] font-medium text-slate-500">Scholar</div>
        </div>
        {/* PubMed Central */}
        <div className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1">
          <span className="text-[7px] font-medium text-slate-500">PubMed</span>
          <div className="text-[7px] font-medium text-slate-500">Central</div>
        </div>
      </div>
    </div>

    {/* Right Column - Verified Sources */}
    <div className="flex-1 flex flex-col">
      <div className="text-[7px] font-medium text-slate-400 uppercase tracking-wider mb-2">Verified Sources (12)</div>
      <div className="space-y-2 flex-1">
        {/* Source 1 */}
        <div className="border-l-2 border-blue-500 pl-2">
          <div className="text-[8px] font-semibold text-blue-600">DOI : 10.1038/s41</div>
          <div className="text-[6px] text-slate-400 leading-tight">Nature, Vol 626, pp. 43-62,</div>
          <div className="text-[6px] text-slate-400">(2024)</div>
        </div>
        {/* Source 2 */}
        <div className="border-l-2 border-slate-200 pl-2">
          <div className="text-[8px] font-semibold text-blue-600">DOI : 10.1145/3581783</div>
          <div className="text-[6px] text-slate-400 leading-tight">ACM Computing Surveys,</div>
          <div className="text-[6px] text-slate-400">(2024)</div>
        </div>
      </div>
    </div>
  </div>
);

export default function FeatureCarousel({ lang }: FeatureCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const features = FEATURES[lang];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, features.length]);

  const renderMockup = (id: number) => {
    switch (id) {
      case 1: return <AIDetectionMockup />;
      case 2: return <AcademicFormatMockup />;
      case 3: return <ReferencesMockup />;
      default: return null;
    }
  };

  return (
    <div
      className="relative w-full max-w-6xl mx-auto px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cards Container */}
      <div className="relative h-[260px] sm:h-[300px] flex items-center justify-center">
        {features.map((feature, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === (activeIndex - 1 + features.length) % features.length;
          const isNext = index === (activeIndex + 1) % features.length;

          let translateX = '0%';
          let scale = 1;
          let opacity = 1;
          let zIndex = 10;

          if (isActive) {
            translateX = '0%';
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (isPrev) {
            translateX = '-85%';
            scale = 0.9;
            opacity = 0.7;
            zIndex = 20;
          } else if (isNext) {
            translateX = '85%';
            scale = 0.9;
            opacity = 0.7;
            zIndex = 20;
          } else {
            opacity = 0;
            scale = 0.8;
          }

          return (
            <div
              key={feature.id}
              onClick={() => setActiveIndex(index)}
              className={`absolute w-[340px] sm:w-[480px] h-[220px] sm:h-[260px] cursor-pointer transition-all duration-500 ease-out ${isActive ? 'drop-shadow-[0_0_25px_rgba(99,102,241,0.25)]' : ''}`}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity,
                zIndex
              }}
            >
              {/* Glow Effect for Active Card */}
              {isActive && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-3xl blur-xl pointer-events-none"></div>
              )}
              {/* Card */}
              <div className={`relative w-full h-full bg-white rounded-2xl overflow-hidden flex border ${isActive ? 'shadow-2xl border-blue-200/50 ring-1 ring-blue-100' : 'shadow-lg border-slate-100'}`}>
                {/* Left: Text Content */}
                <div className="w-[42%] p-4 sm:p-5 flex flex-col justify-center">
                  <h3 className="text-lg sm:text-2xl font-bold leading-tight">
                    <span className="text-blue-600">{feature.titleBlue}</span>
                    <span className="text-slate-900">{feature.titleDash}</span>
                    <span className="text-slate-900">{feature.titleBlack}</span>
                  </h3>
                  <div className="text-lg sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{feature.subtitle}</div>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {feature.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500 rounded-full mt-1 sm:mt-1.5 flex-shrink-0"></span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Mockup */}
                <div className="w-[58%] bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-3">
                  {renderMockup(feature.id)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

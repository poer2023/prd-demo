'use client';

import { Lang } from '@/lib/essaypass-types';
import FeatureCarousel from './FeatureCarousel';

interface HeroProps {
  lang: Lang;
}

const HERO_TEXT = {
  en: {
    titleHighlight: 'Academic-Grade',
    titleRest: 'AI Essay Writer',
    badges: [
      { icon: 'check', label: 'Low AI Risk' },
      { icon: 'book', label: 'Real References' },
      { icon: 'format', label: 'Academic Format' }
    ],
    cta: 'Ready to begin ?'
  },
  zh: {
    titleHighlight: '学术级',
    titleRest: 'AI 论文写作',
    badges: [
      { icon: 'check', label: '低 AI 风险' },
      { icon: 'book', label: '真实引用' },
      { icon: 'format', label: '学术格式' }
    ],
    cta: '准备开始？'
  }
};

export default function Hero({ lang }: HeroProps) {
  const t = HERO_TEXT[lang];

  const renderBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'check':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'format':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative z-10 pt-6 pb-0">
        {/* Main Title */}
        <div className="text-center mb-6 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-fade-in-up">
            <span className="text-blue-600 italic">{t.titleHighlight}</span>
            <span className="text-slate-900"> {t.titleRest}</span>
          </h1>
        </div>

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 px-2 sm:px-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {t.badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-white/80 rounded-full border border-slate-200/60 text-[11px] sm:text-xs whitespace-nowrap"
            >
              {renderBadgeIcon(badge.icon)}
              <span className="font-medium text-slate-600">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Feature Carousel */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <FeatureCarousel lang={lang} />
        </div>
      </div>
    </section>
  );
}

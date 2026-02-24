'use client';

import { useState } from 'react';
import Hero from './Hero';
import { Lang } from '@/lib/essaypass-types';

/**
 * EssayPass Hero 区域原型
 * 独立展示 Hero 标题 + 特性徽章 + 轮播图
 */
export default function HeroPage() {
    const [lang] = useState<Lang>('en');

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="pt-8 pb-16">
                <Hero lang={lang} />
            </div>
        </div>
    );
}

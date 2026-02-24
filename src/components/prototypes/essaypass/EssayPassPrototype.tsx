'use client';

import { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import EssayForm from './EssayForm';
import { Lang, EssayFormData } from './types';

export default function EssayPassPrototype() {
  const [lang, setLang] = useState<Lang>('en');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<EssayFormData | null>(null);

  const handleFormSubmit = (data: EssayFormData) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  if (showConfirmation && formData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header lang={lang} onLangChange={setLang} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {lang === 'zh' ? '订单确认' : 'Order Confirmation'}
              </h2>
              <p className="text-slate-500">
                {lang === 'zh' ? '您的论文请求已提交' : 'Your essay request has been submitted'}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'zh' ? '题目' : 'Topic'}</span>
                <span className="font-medium text-slate-900">{formData.topic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'zh' ? '类型' : 'Type'}</span>
                <span className="font-medium text-slate-900">{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'zh' ? '字数' : 'Word Count'}</span>
                <span className="font-medium text-slate-900">{formData.wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{lang === 'zh' ? '引用格式' : 'Citation Style'}</span>
                <span className="font-medium text-slate-900">{formData.citationStyle}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 px-6 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                {lang === 'zh' ? '返回修改' : 'Go Back'}
              </button>
              <button
                className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {lang === 'zh' ? '继续支付' : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header lang={lang} onLangChange={setLang} />
      <Hero lang={lang} />
      <EssayForm lang={lang} onSubmit={handleFormSubmit} />
    </div>
  );
}

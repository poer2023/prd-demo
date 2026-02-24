'use client';

import React from 'react';

// --- Label ---
interface LabelProps {
    required?: boolean;
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
    isFilled?: boolean;
}

export const Label: React.FC<LabelProps> = ({ required, children, htmlFor, className = "", isFilled }) => (
    <label htmlFor={htmlFor} className={`flex items-center text-sm text-slate-700 mb-2 ${className}`}>
        {isFilled ? (
            <span className="text-emerald-500 mr-1.5 flex items-center" title="Filled">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </span>
        ) : (
            required && <span className="text-red-500 mr-1">*</span>
        )}
        <span className={isFilled ? "text-slate-900 font-medium" : ""}>{children}</span>
    </label>
);

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    required?: boolean;
    options: { value: string; label: string }[];
    isFilled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, required, options, className, isFilled, ...props }) => (
    <div className="w-full">
        {label && <Label required={required} htmlFor={props.id} isFilled={isFilled}>{label}</Label>}
        <div className="relative">
            <select
                className={`
          w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-lg
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 pr-10
          transition-all duration-200 cursor-pointer
          ${isFilled ? 'bg-emerald-50/30 border-emerald-200' : ''}
          ${className}
        `}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>
);

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    required?: boolean;
    isFilled?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, required, className, isFilled, ...props }) => (
    <div className="w-full">
        {label && <Label required={required} htmlFor={props.id} isFilled={isFilled}>{label}</Label>}
        <input
            className={`
        w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3
        placeholder-slate-400 transition-all duration-200
        ${isFilled ? 'bg-emerald-50/30 border-emerald-200' : ''}
        ${className}
      `}
            {...props}
        />
    </div>
);

// --- TextArea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    required?: boolean;
    maxChars?: number;
    isFilled?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, required, maxChars, className, value, isFilled, ...props }) => {
    const currentLength = (value as string)?.length || 0;

    return (
        <div className="w-full">
            {label && <Label required={required} htmlFor={props.id} isFilled={isFilled}>{label}</Label>}
            <div className="relative">
                <textarea
                    className={`
            w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-4 pb-10
            resize-y min-h-[140px] placeholder-slate-400 transition-all duration-200
            ${isFilled ? 'bg-emerald-50/30 border-emerald-200' : ''}
            ${className}
          `}
                    value={value}
                    {...props}
                />
                {/* Plus Icon Bottom Left */}
                <div className="absolute bottom-3 left-3 text-slate-400 hover:text-blue-500 cursor-pointer transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </div>
                {/* Char count Bottom Right */}
                {maxChars && (
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                        {currentLength} / {maxChars}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Checkbox Card ---
interface CheckboxCardProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const CheckboxCard: React.FC<CheckboxCardProps> = ({ label, checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200 select-none"
    >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
            {checked && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className="text-sm text-slate-700">{label}</span>
    </div>
);

// --- Radio Card ---
interface RadioCardProps {
    label: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
}

export const RadioCard: React.FC<RadioCardProps> = ({ label, name, value, checked, onChange }) => (
    <label className="flex items-center gap-3 cursor-pointer border border-slate-200 rounded-lg px-4 py-3.5 bg-white hover:bg-slate-50/50 hover:border-slate-300 transition-all duration-200 select-none">
        <div className="relative flex items-center">
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'border-blue-600' : 'border-slate-300'}`}>
                {checked && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
            </div>
        </div>
        <span className={`text-sm transition-colors ${checked ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>{label}</span>
    </label>
);

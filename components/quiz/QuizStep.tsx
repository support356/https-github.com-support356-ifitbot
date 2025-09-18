import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BodyFatSelector from './BodyFatSelector';

interface StepConfig {
    id: string;
    question: string;
    subtitle?: string;
    type: string;
    placeholder?: string;
    inputType?: string;
    unit?: string;
    options?: { id: string; label: string; desc?: string }[];
    min?: number;
    max?: number;
}

interface QuizStepProps {
    step: number;
    totalSteps: number;
    stepConfig: StepConfig;
    value: any;
    onChange: (value: any) => void;
    onNext: () => void;
    onBack: () => void;
    canGoNext: boolean;
    isLast: boolean;
}

const TextInput = ({ value, onChange, stepConfig }: { value: string, onChange: (v: string) => void, stepConfig: StepConfig }) => (
    <input
        type={stepConfig.inputType || 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={stepConfig.placeholder}
        className="w-full max-w-lg text-2xl p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
);

const NumberInput = ({ value, onChange, stepConfig }: { value: number, onChange: (v: number) => void, stepConfig: StepConfig }) => (
     <div className="relative max-w-lg w-full">
        <input
            type="number"
            value={value || ''}
            onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (isNaN(num)) {
                    onChange(undefined as any);
                    return;
                }
                onChange(num)
            }}
            placeholder={stepConfig.placeholder}
            min={stepConfig.min}
            max={stepConfig.max}
            className="w-full text-2xl p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-20"
        />
        {stepConfig.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">{stepConfig.unit}</span>}
    </div>
);

const SingleSelect = ({ value, onChange, stepConfig }: { value: string, onChange: (v: string) => void, stepConfig: StepConfig }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {stepConfig.options?.map(option => (
            <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className={`p-6 border-2 rounded-lg text-left transition-all duration-200 ${value === option.id ? 'bg-orange-500/10 border-orange-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
            >
                <h3 className="text-xl font-semibold text-white">{option.label}</h3>
                {option.desc && <p className="text-gray-400 mt-1">{option.desc}</p>}
            </button>
        ))}
    </div>
);

export default function QuizStep({ step, totalSteps, stepConfig, value, onChange, onNext, onBack, canGoNext, isLast }: QuizStepProps) {
    const progress = (step / totalSteps) * 100;

    const renderInput = () => {
        switch (stepConfig.type) {
            case 'text_input':
                return <TextInput value={value} onChange={onChange} stepConfig={stepConfig} />;
            case 'number_input':
                return <NumberInput value={value} onChange={onChange} stepConfig={stepConfig} />;
            case 'single_select':
                 return <SingleSelect value={value} onChange={onChange} stepConfig={stepConfig} />;
            case 'body_fat_selector':
                return <BodyFatSelector value={value} onChange={onChange} />;
            default:
                return <p>Unknown step type</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
            <header className="w-full max-w-4xl mx-auto pt-8">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{stepConfig.question}</h1>
                {stepConfig.subtitle && <p className="text-lg text-gray-400 mb-8 max-w-2xl">{stepConfig.subtitle}</p>}
                <div className="w-full flex justify-center">{renderInput()}</div>
            </main>
            <footer className="w-full max-w-4xl mx-auto py-8 flex justify-between items-center">
                <button
                    onClick={onBack}
                    disabled={step === 1}
                    className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition"
                >
                    <ArrowLeft />
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {isLast ? 'Generate Report' : 'Next'}
                    <ArrowRight />
                </button>
            </footer>
        </div>
    );
}
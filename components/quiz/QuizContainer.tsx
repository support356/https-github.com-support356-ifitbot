
import React, { useState } from 'react';
import QuizWelcome from './QuizWelcome';
import QuizStep from './QuizStep';
import type { QuizData } from '../../types';

const quizSteps = [
    { id: "name", question: "What should we call you?", type: "text_input", placeholder: "Enter your name", required: true },
    { id: "email", question: "What's your email address?", subtitle: "We'll use this to save and send your results.", type: "text_input", inputType: "email", placeholder: "Enter your email", required: true },
    { id: "gender", question: "Choose your gender", subtitle: "This helps us personalize your training approach.", type: "single_select", options: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }], required: true },
    { id: "age", question: "What's your age?", type: "number_input", placeholder: "Enter your age", required: true, min: 13, max: 99 },
    { id: "currentWeight", question: "What's your current weight (kg)?", type: "number_input", placeholder: "e.g., 75", unit: "kg", required: true, min: 30, max: 300 },
    { id: "height", question: "What's your height (cm)?", type: "number_input", placeholder: "e.g., 180", unit: "cm", required: true, min: 100, max: 250 },
    { id: "goal", question: "What is your primary goal?", subtitle: "This helps us tailor the recommendations.", type: "single_select", options: [{id: 'lose_weight', label: 'Lose Weight'}, {id: 'gain_muscle', label: 'Gain Muscle'}, {id: 'get_shredded', label: 'Get Shredded'}], required: true },
    { id: "targetWeight", question: "What's your target weight (kg)?", type: "number_input", placeholder: "e.g., 70", unit: "kg", required: true, min: 30, max: 300 },
    { id: "targetPeriodWeeks", question: "How many weeks to achieve this goal?", subtitle: "A realistic timeframe is key for success. (e.g., 8, 12, 16)", type: "number_input", placeholder: "e.g., 12", unit: "weeks", required: true, min: 2, max: 52 },
    { id: "bodyFatPercentage", question: "Estimate your level of body fat", subtitle: "Drag the slider to match your current physique.", type: "body_fat_selector", required: true, defaultValue: 22 },
    { id: "fitnessLevel", question: "What's your current fitness level?", type: "single_select", options: [{ id: "beginner", label: "Beginner", desc: "Just starting out or returning after a long break." }, { id: "amateur", label: "Amateur", desc: "I exercise sometimes but not consistently." }, { id: "advanced", label: "Advanced", desc: "I'm in great shape and train regularly." }], required: true },
    { id: "workoutFrequency", question: "How many times per week have you trained in the last 3 months?", type: "single_select", options: [{ id: "not_at_all", label: "Not at all" }, { id: "1-2_times", label: "1-2 times a week" }, { id: "3_times", label: "3 times a week" }, { id: "more_than_3", label: "More than 3 times a week" }], required: true },
    // New lifestyle questions for deeper personalization
    { id: "workoutLocation", question: "Where do you prefer to work out?", type: "single_select", options: [{ id: "home", label: "At Home" }, { id: "gym", label: "At the Gym" }, { id: "both", label: "Both Home & Gym" }], required: true },
    { id: "sleepHours", question: "On average, how many hours do you sleep per night?", type: "single_select", options: [{ id: "less_than_5", label: "Less than 5 hours" }, { id: "5_to_6", label: "5-6 hours" }, { id: "7_to_8", label: "7-8 hours" }, { id: "more_than_8", label: "More than 8 hours" }], required: true },
    { id: "stressLevel", question: "How would you describe your current stress levels?", type: "single_select", options: [{ id: "low", label: "Low" }, { id: "moderate", label: "Moderate" }, { id: "high", label: "High" }], required: true },
    { id: "dietType", question: "Which best describes your current diet?", type: "single_select", options: [{ id: "balanced", label: "Balanced Diet" }, { id: "low_carb", label: "Low-Carb" }, { id: "vegetarian", label: "Vegetarian" }, { id: "vegan", label: "Vegan" }, { id: "other", label: "Other / No specific diet" }], required: true }
];

const getInitialAnswers = () => {
    const initial: Partial<QuizData> = {};
    quizSteps.forEach(step => {
        if ('defaultValue' in step && typeof step.defaultValue !== 'undefined') {
            (initial as any)[step.id] = step.defaultValue;
        }
    });
    return initial;
};


export default function QuizContainer({ onComplete }: { onComplete: (data: QuizData) => void }) {
    const [showWelcome, setShowWelcome] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Partial<QuizData>>(getInitialAnswers());

    if (showWelcome) {
        return <QuizWelcome onStart={() => setShowWelcome(false)} />;
    }

    const currentStepConfig = quizSteps[currentStep];
    const isLastStep = currentStep === quizSteps.length - 1;

    const canGoNext = () => {
        const currentAnswer = answers[currentStepConfig.id as keyof QuizData];
        if (!currentStepConfig.required) return true;
        
        if (Array.isArray(currentAnswer)) {
            return currentAnswer.length > 0;
        }
        
        return currentAnswer !== undefined && currentAnswer !== null && `${currentAnswer}`.trim() !== "";
    };

    const handleNext = async () => {
        if (isLastStep) {
            if (canGoNext()) {
              onComplete(answers as QuizData);
            }
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleAnswerChange = (value: any) => {
        setAnswers(prev => ({
            ...prev,
            [currentStepConfig.id]: value
        }));
    };

    return (
        <QuizStep
            step={currentStep + 1}
            totalSteps={quizSteps.length}
            value={answers[currentStepConfig.id as keyof QuizData]}
            onChange={handleAnswerChange}
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
            isLast={isLastStep}
            stepConfig={currentStepConfig}
        />
    );
}
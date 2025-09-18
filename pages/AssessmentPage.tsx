
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContainer from '../components/quiz/QuizContainer';
import { AppContext } from '../App';
import type { QuizData } from '../types';

export default function AssessmentPage() {
    const { setQuizData } = useContext(AppContext);
    const navigate = useNavigate();

    const handleQuizComplete = (data: QuizData) => {
        // Here you would typically save the data to a backend and get an ID
        const dataWithId = { ...data, id: new Date().toISOString() };
        setQuizData(dataWithId);
        navigate('/report');
    };

    return <QuizContainer onComplete={handleQuizComplete} />;
}


import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AssessmentPage from './pages/AssessmentPage';
import ReportPage from './pages/ReportPage';
import WorkoutGuidePage from './pages/WorkoutGuidePage';
import type { QuizData } from './types';

export const AppContext = React.createContext<{
    quizData: QuizData | null;
    setQuizData: React.Dispatch<React.SetStateAction<QuizData | null>>;
}>({
    quizData: null,
    setQuizData: () => {},
});

export default function App() {
    const [quizData, setQuizData] = useState<QuizData | null>(null);

    return (
        <AppContext.Provider value={{ quizData, setQuizData }}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/assessment" element={<AssessmentPage />} />
                    <Route path="/report" element={quizData ? <ReportPage /> : <Navigate to="/assessment" />} />
                    <Route path="/workout-guide" element={<WorkoutGuidePage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </HashRouter>
        </AppContext.Provider>
    );
}

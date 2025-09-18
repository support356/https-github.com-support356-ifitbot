
import React, { useState, useContext, useRef } from 'react';
import { AppContext } from '../App';
import type { WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { Loader, Dumbbell, AlertTriangle, Download, Share2, ArrowLeft, Zap, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const WorkoutPlanDisplay = React.forwardRef<HTMLDivElement, { plan: WorkoutPlan, name: string }>(({ plan, name }, ref) => {
    if (!plan) return null;

    return (
        <div ref={ref} className="bg-white text-gray-800 p-4 sm:p-8 md:p-10 rounded-lg shadow-2xl printable-area font-sans">
            {/* Header */}
            <div className="text-center mb-10 border-b-2 border-gray-200 pb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{plan.title}</h1>
                <p className="text-md sm:text-lg text-gray-600 mt-2">Your <span className="font-semibold text-orange-600">{plan.duration_weeks}-Week Transformation Plan</span> for {name}</p>
                <p className="text-md text-gray-500 mt-2 max-w-2xl mx-auto">{plan.description}</p>
            </div>
            
            {/* Progression Principle */}
            <div className="mb-10 bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-3 text-orange-700 flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    {plan.progression_principle.title}
                </h2>
                <p className="text-gray-700 leading-relaxed">{plan.progression_principle.description}</p>
            </div>


            {/* Weekly Workouts */}
            {plan.weekly_workouts.map(week => (
                <div key={week.week} className="mb-12">
                    <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-l-4 border-orange-500 pl-4">Week {week.week}</h2>
                    <div className="space-y-8">
                        {week.workouts.map(workout => (
                            <div key={workout.day} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900">Day {workout.day}: {workout.title} <span className="text-gray-500 font-normal text-base">- Approx. {workout.estimated_duration} min</span></h3>
                                    
                                    {/* Warm-up */}
                                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                                        <h4 className="font-semibold text-blue-800">Warm-up</h4>
                                        <p className="text-sm text-blue-700">{workout.warmup}</p>
                                    </div>

                                     <ul className="space-y-4 mt-4">
                                        {workout.exercises.map((ex, i) => (
                                            <li key={i} className="pb-4 border-b border-gray-200 last:border-b-0">
                                                <h4 className="font-bold text-lg text-gray-800">{ex.name}</h4>
                                                <div className="flex flex-wrap justify-between items-center text-gray-600 mt-1 text-sm gap-x-4">
                                                    <span><span className="font-medium">Sets:</span> {ex.sets}</span>
                                                    <span><span className="font-medium">Reps:</span> {ex.reps}</span>
                                                    <span><span className="font-medium">Rest:</span> {ex.rest_seconds}s</span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">{ex.instructions}</p>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Cool-down */}
                                    <div className="mt-4 bg-green-50 border border-green-200 rounded p-3">
                                        <h4 className="font-semibold text-green-800">Cool-down</h4>
                                        <p className="text-sm text-green-700">{workout.cooldown}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
             <div className="mt-12 text-center text-sm text-gray-500 border-t pt-4">
                <p>Disclaimer: This AI-generated plan is for informational purposes. Consult a professional before starting.</p>
            </div>
        </div>
    );
});

export default function WorkoutGuidePage() {
    const { quizData } = useContext(AppContext);
    const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const planRef = useRef<HTMLDivElement>(null);

    const handleGeneratePlan = async () => {
        if (!quizData) {
            setError("Please complete a Body Assessment first to generate a workout guide.");
            return;
        };
        setLoading(true);
        setError(null);
        setGeneratedPlan(null);

        try {
            const response = await generateWorkoutPlan(quizData);
            setGeneratedPlan(response);
        } catch (err) {
            console.error(err);
            setError("Failed to generate the workout plan. The AI might be busy. Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSaveAsPdf = () => {
        const input = planRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            let position = 0;
            let pageHeightLeft = canvasHeight;

            pdf.addImage(imgData, 'PNG', 0, 0, width, height * (canvasHeight / canvas.height));
            pageHeightLeft -= (pdfHeight * canvas.height / height);

            while (pageHeightLeft > 0) {
              position -= pdfHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, width, height * (canvasHeight / canvas.height));
              pageHeightLeft -= (pdfHeight * canvas.height / height);
            }
            pdf.save(`iFitBot_WorkoutPlan_${quizData?.name}.pdf`);
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: 'My iFitBot Workout Plan', text: 'Check out my personalized workout plan from iFitBot!', url: window.location.href, }).catch(console.error);
        } else {
            alert("Share feature not available on this browser. You can save as PDF or copy the URL.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 <Link to="/" className="text-gray-300 hover:text-orange-500 flex items-center mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <div className="text-center mb-12">
                    <Dumbbell className="w-16 h-16 mx-auto text-orange-500 mb-4" />
                    <h1 className="text-5xl font-bold mb-2">Workout Guide Generator</h1>
                    <p className="text-lg text-gray-400">Turn your assessment into an actionable, day-by-day workout plan.</p>
                </div>
                
                {!generatedPlan && !loading && (
                    <div className="text-center">
                        {quizData ? (
                             <button onClick={handleGeneratePlan} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-semibold rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
                                Generate My Expert Plan
                            </button>
                        ) : (
                            <div className="bg-yellow-900/50 text-yellow-300 p-4 rounded-lg flex flex-col items-center gap-4">
                                <AlertTriangle /> 
                                <p>No assessment data found. Please complete an assessment first.</p>
                                <Link to="/assessment" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">
                                    Start Assessment
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                
                {loading && (
                    <div className="text-center text-white p-10">
                        <Loader className="w-12 h-12 mx-auto animate-spin text-orange-500 mb-4" />
                        <h2 className="text-2xl font-semibold">Crafting Your Pro Workout Plan...</h2>
                        <p className="text-gray-400">Our AI coach is designing your weekly schedule. This may take a moment.</p>
                    </div>
                )}

                {error && (
                    <div className="text-center text-white bg-red-900/50 p-10 rounded-lg">
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-semibold">An Error Occurred</h2>
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {!loading && generatedPlan && quizData && (
                     <>
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={handleSaveAsPdf} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                <Download className="w-4 h-4 mr-2" />
                                Save as PDF
                            </button>
                            <button onClick={handleShare} className="text-white border border-gray-600 hover:bg-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Plan
                            </button>
                             <button onClick={handleGeneratePlan} title="Regenerate Plan" className="text-white border border-gray-600 hover:bg-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate
                            </button>
                        </div>
                        <WorkoutPlanDisplay ref={planRef} plan={generatedPlan} name={quizData.name} />
                    </>
                )}
            </div>
        </div>
    );
}
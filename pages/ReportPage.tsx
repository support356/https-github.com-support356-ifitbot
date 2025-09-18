
import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../App';
import type { ReportData, QuizData } from '../types';
import { generateAssessmentReport } from '../services/geminiService';
import { Download, Share2, Loader, AlertTriangle, ArrowLeft, Droplets, Bed, BrainCircuit, Utensils, Flame, Target, PieChart, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


const MetricCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType, label: string, value: string, unit: string }) => (
    <div className="bg-gray-50/50 p-4 rounded-lg flex items-center gap-4">
        <div className="bg-orange-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-orange-600" />
        </div>
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value} <span className="text-base font-normal text-gray-500">{unit}</span></p>
        </div>
    </div>
);


const ReportContent = React.forwardRef<HTMLDivElement, { reportData: ReportData, quizData: QuizData }>(({ reportData, quizData }, ref) => {
  if (!reportData) return null;

  const { protein_grams, carbs_grams, fat_grams } = reportData.nutrition.macros;
  const totalMacros = protein_grams + carbs_grams + fat_grams;
  const proteinPercent = Math.round((protein_grams / totalMacros) * 100);
  const carbsPercent = Math.round((carbs_grams / totalMacros) * 100);
  const fatPercent = 100 - proteinPercent - carbsPercent;
  
  return (
    <div ref={ref} className="bg-white text-gray-800 p-4 sm:p-8 md:p-10 rounded-lg shadow-2xl printable-area font-sans">
      {/* Header */}
      <div className="text-center mb-10 border-b-2 border-gray-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Your iFitBot Assessment</h1>
        <p className="text-md sm:text-lg text-gray-600 mt-2">Exclusively prepared for: <span className="font-semibold text-orange-600">{quizData.name}</span></p>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary */}
      <div className="mb-10 bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-3 text-orange-700">A Message From Your AI Coach</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reportData.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics & Nutrition */}
        <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2"><Target className="text-orange-500"/> Your Key Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard icon={Flame} label="Daily Calories" value={String(Math.round(reportData.nutrition.daily_calories))} unit="kcal" />
                    <MetricCard icon={PieChart} label="BMI" value={reportData.metrics.bmi.toFixed(1)} unit={`(${reportData.metrics.bmi_category})`} />
                    <MetricCard icon={Utensils} label="BMR (Resting)" value={String(Math.round(reportData.metrics.bmr))} unit="kcal/day" />
                    <MetricCard icon={CheckCircle} label="TDEE (Active)" value={String(Math.round(reportData.metrics.tdee))} unit="kcal/day" />
                </div>
            </div>

            {/* Nutrition Plan */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2"><PieChart className="text-orange-500"/> Daily Nutrition Plan</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-center text-gray-600 mb-4">{reportData.nutrition.calorie_explanation}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                        {/* Donut Chart */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.915" className="stroke-current text-gray-200" strokeWidth="3" fill="transparent"></circle>
                                <circle cx="18" cy="18" r="15.915" className="stroke-current text-blue-500" strokeWidth="3" fill="transparent" strokeDasharray={`${proteinPercent}, 100`} strokeDashoffset="0"></circle>
                                <circle cx="18" cy="18" r="15.915" className="stroke-current text-green-500" strokeWidth="3" fill="transparent" strokeDasharray={`${carbsPercent}, 100`} strokeDashoffset={`-${proteinPercent}`}></circle>
                                <circle cx="18" cy="18" r="15.915" className="stroke-current text-yellow-500" strokeWidth="3" fill="transparent" strokeDasharray={`${fatPercent}, 100`} strokeDashoffset={`-${proteinPercent + carbsPercent}`}></circle>
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-3xl font-bold text-gray-800">{Math.round(reportData.nutrition.daily_calories)}</span>
                                <span className="text-sm block text-gray-500">Kcal</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><div><span className="font-bold">{Math.round(protein_grams)}g</span> <span className="text-gray-600">Protein</span></div></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><div><span className="font-bold">{Math.round(carbs_grams)}g</span> <span className="text-gray-600">Carbs</span></div></div>
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><div><span className="font-bold">{Math.round(fat_grams)}g</span> <span className="text-gray-600">Fats</span></div></div>
                        </div>
                    </div>
                </div>
            </div>
             {/* Sample Meal Day */}
            <div>
                 <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2"><Utensils className="text-orange-500"/> Sample Meal Day</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-center text-gray-600 text-sm italic">{reportData.sampleMealDay.title}</p>
                    {reportData.sampleMealDay.meals.map(meal => (
                        <div key={meal.name} className="border-b pb-2 last:border-0">
                            <p className="font-bold text-gray-800">{meal.name}</p>
                            <p className="text-gray-600">{meal.description}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>

        {/* Right Column: Recommendations */}
        <div className="lg:col-span-1">
            <div className="bg-orange-50 rounded-lg p-6 sticky top-8">
                <h2 className="text-2xl font-semibold mb-4 text-orange-700">Top Recommendations</h2>
                <ul className="space-y-4">
                    {reportData.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>


      {/* Disclaimer */}
      <div className="mt-12 text-center text-sm text-gray-500 border-t pt-4">
        <p>Disclaimer: This AI-generated report is for informational purposes only. Consult with a healthcare professional before starting any new fitness or nutrition plan.</p>
      </div>
    </div>
  );
});

export default function ReportPage() {
    const { quizData } = useContext(AppContext);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!quizData) {
            navigate('/assessment');
            return;
        }

        const generateReport = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await generateAssessmentReport(quizData);
                setReportData(response);
            } catch (err) {
                console.error(err);
                setError("Failed to generate the AI report. The model may be busy or the request could not be processed. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        generateReport();
    }, [quizData, navigate]);

    const handleSaveAsPdf = () => {
        const input = reportRef.current;
        if (!input) return;
        html2canvas(input, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`iFitBot_Assessment_${quizData?.name}.pdf`);
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My iFitBot Body Assessment',
                text: 'Check out my personalized fitness assessment from iFitBot!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            alert("Share feature is not supported on your browser. You can save as PDF or copy the URL.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 md:p-8">
            <div className="w-full max-w-5xl">
                 <Link to="/assessment" className="text-gray-300 hover:text-orange-500 flex items-center mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assessment
                </Link>
                {loading && (
                    <div className="text-center text-white p-10">
                        <Loader className="w-12 h-12 mx-auto animate-spin text-orange-500 mb-4" />
                        <h2 className="text-2xl font-semibold">Generating Your Pro-Level Report...</h2>
                        <p className="text-gray-400">Our AI coach is analyzing your data to create your personalized plan.</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-white bg-red-900/50 p-10 rounded-lg">
                        <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-semibold">An Error Occurred</h2>
                        <p className="text-red-300 max-w-md mx-auto">{error}</p>
                    </div>
                )}
                {!loading && !error && reportData && quizData && (
                    <>
                        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={handleSaveAsPdf} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                <Download className="w-4 h-4 mr-2" />
                                Save as PDF
                            </button>
                            <button onClick={handleShare} className="text-white border border-gray-600 hover:bg-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Report
                            </button>
                            <Link to="/workout-guide" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center text-center">
                                Generate My Workout Guide
                            </Link>
                        </div>
                        <ReportContent ref={reportRef} reportData={reportData} quizData={quizData} />
                    </>
                )}
            </div>
        </div>
    );
}
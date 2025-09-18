import { GoogleGenAI, Type } from "@google/genai";
import type { QuizData } from '../types';

// Fix: Per coding guidelines, API key must be obtained from process.env.API_KEY.
// This also resolves the TypeScript error regarding 'import.meta.env'.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // This check is crucial for debugging and fails safely if the key isn't configured.
  console.error("API_KEY environment variable is not set. Please check your deployment environment variables.");
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey });

export const generateAssessmentReport = async (quizData: QuizData) => {
    const prompt = `
        Act as an elite, certified personal trainer and nutritionist with a friendly, motivational, and highly knowledgeable tone. Your name is Alex, the AI coach for iFitBot.
        Generate a comprehensive, professional body assessment report for the user. Be encouraging and scientific.

        User Data: ${JSON.stringify(quizData)}
        
        Analyze all the provided data, including lifestyle factors, to generate the following sections:
        1.  **Summary**: Write a brief, encouraging executive summary (as Alex). Address the user by name. Acknowledge their primary goal and affirm that it's achievable with their commitment and this plan.
        2.  **Key Metrics**: Calculate the following:
            - BMI (Body Mass Index).
            - BMI Category (e.g., Underweight, Normal, Overweight).
            - BMR (Basal Metabolic Rate) using the Mifflin-St Jeor equation.
            - TDEE (Total Daily Energy Expenditure) based on their activity level. Use these multipliers for TDEE: beginner=1.2 (sedentary), amateur=1.375 (lightly active), advanced=1.55 (moderately active).
        3.  **Nutrition Plan**:
            - Calculate the target daily calorie intake. To do this, first determine the total calorie deficit/surplus needed to reach the target weight (1kg weight change ≈ 7700 kcal). Distribute this total over the 'targetPeriodWeeks'. This gives the daily deficit/surplus. Apply it to the TDEE to get the final target.
            - Provide a clear, simple explanation for the calorie target.
            - Calculate macronutrient targets in grams: Protein at 1.8g per kg of CURRENT body weight. Fat at 25% of total calories. Carbohydrates for the remainder. (1g Protein=4kcal, 1g Carb=4kcal, 1g Fat=9kcal).
        4.  **Sample Meal Day**: Create a simple, example meal day that aligns with the calculated calorie and macro targets. Include a title and brief descriptions for Breakfast, Lunch, Dinner, and one Snack. This is an illustrative guide, not a strict prescription.
        5.  **Key Recommendations**: Provide 4-5 highly actionable, non-workout recommendations based on their lifestyle data (sleep, stress, diet type). For example, if stress is high, suggest a specific stress-management technique. If sleep is low, provide a concrete tip for improving sleep hygiene.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    metrics: {
                        type: Type.OBJECT,
                        properties: {
                            bmi: { type: Type.NUMBER },
                            bmi_category: { type: Type.STRING },
                            bmr: { type: Type.NUMBER },
                            tdee: { type: Type.NUMBER },
                        }
                    },
                    nutrition: {
                        type: Type.OBJECT,
                        properties: {
                            daily_calories: { type: Type.NUMBER },
                            calorie_explanation: { type: Type.STRING },
                            macros: {
                                type: Type.OBJECT,
                                properties: {
                                    protein_grams: { type: Type.NUMBER },
                                    carbs_grams: { type: Type.NUMBER },
                                    fat_grams: { type: Type.NUMBER },
                                }
                            }
                        }
                    },
                    sampleMealDay: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            meals: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });

    return JSON.parse(response.text);
};

export const generateWorkoutPlan = async (quizData: QuizData) => {
    const prompt = `
        Act as an elite, certified personal trainer (Alex from iFitBot). Your tone is motivating, clear, and expert.
        Create a detailed, week-by-week workout plan for the user based on their assessment data.

        Assessment Data: ${JSON.stringify(quizData)}

        Instructions:
        1.  **Title & Description**: Create a motivational title and a short, encouraging description for the overall plan.
        2.  **Plan Duration**: The plan's duration must exactly match the user's 'targetPeriodWeeks'.
        3.  **Progression Principle**: At the start of the plan, explain the principle of Progressive Overload in a simple, motivational paragraph. Title this section "Your Key to Success: Progressive Overload".
        4.  **Workout Frequency**: The number of workout days per week must align with their 'workoutFrequency': 'not_at_all' or '1-2_times' should be 3 days/week. '3_times' should be 4 days/week. 'more_than_3' should be 5 days/week.
        5.  **Workout Structure**: For each workout day, provide:
            - A clear title (e.g., 'Full Body Strength A', 'Upper Body & Core').
            - An estimated duration in minutes.
            - **Warm-up**: A brief, 2-3 sentence description of a dynamic warm-up (e.g., "5 minutes of light cardio followed by leg swings and arm circles.").
            - **Exercises**: A list of exercises tailored to the user's 'fitnessLevel' and 'workoutLocation' ('home' = bodyweight/minimal equipment, 'gym'/'both' = free weights/machines).
            - For each exercise: name, sets, reps (e.g., '3 sets of 8-12 reps'), rest in seconds, and concise instructions.
            - **Cool-down**: A brief, 2-3 sentence description of a cool-down (e.g., "5 minutes of light stretching, holding each stretch for 30 seconds.").
        6.  **Progression**: The overall plan intensity must progressively increase week-over-week. You can do this by slightly increasing reps, sets, or suggesting more challenging exercise variations in later weeks.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration_weeks: { type: Type.NUMBER },
                    progression_principle: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        }
                    },
                    weekly_workouts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                week: { type: Type.NUMBER },
                                workouts: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            day: { type: Type.NUMBER },
                                            title: { type: Type.STRING },
                                            estimated_duration: { type: Type.NUMBER },
                                            warmup: { type: Type.STRING },
                                            exercises: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        name: { type: Type.STRING },
                                                        sets: { type: Type.NUMBER },
                                                        reps: { type: Type.STRING },
                                                        rest_seconds: { type: Type.NUMBER },
                                                        instructions: { type: Type.STRING }
                                                    }
                                                }
                                            },
                                            cooldown: { type: Type.STRING },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    return JSON.parse(response.text);
};
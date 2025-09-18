
export interface QuizData {
    id?: string;
    name: string;
    email: string;
    gender: 'male' | 'female';
    age: number;
    currentWeight: number;
    height: number;
    goal: 'lose_weight' | 'gain_muscle' | 'get_shredded';
    targetWeight: number;
    targetPeriodWeeks: number;
    bodyFatPercentage?: number;
    fitnessLevel: 'beginner' | 'amateur' | 'advanced';
    workoutFrequency: 'not_at_all' | '1-2_times' | '3_times' | 'more_than_3';
    // New detailed fields for a more holistic assessment
    workoutLocation: 'home' | 'gym' | 'both';
    sleepHours: 'less_than_5' | '5_to_6' | '7_to_8' | 'more_than_8';
    stressLevel: 'low' | 'moderate' | 'high';
    dietType: 'balanced' | 'low_carb' | 'vegetarian' | 'vegan' | 'other';
}

export interface ReportData {
    summary: string;
    metrics: {
        bmi: number;
        bmi_category: string;
        bmr: number;
        tdee: number;
    };
    nutrition: {
        daily_calories: number;
        calorie_explanation: string;
        macros: {
            protein_grams: number;
            carbs_grams: number;
            fat_grams: number;
        };
    };
    // New sample meal day for tangible advice
    sampleMealDay: {
        title: string;
        meals: {
            name: string;
            description: string;
        }[];
    };
    recommendations: string[];
}


export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    instructions: string;
}

export interface Workout {
    day: number;
    title: string;
    estimated_duration: number;
    // New warm-up and cool-down fields
    warmup: string;
    exercises: Exercise[];
    cooldown: string;
}

export interface WeeklyWorkout {
    week: number;
    workouts: Workout[];
}

export interface WorkoutPlan {
    title: string;
    description: string;
    duration_weeks: number;
    // New progression principle for long-term success
    progression_principle: {
        title: string;
        description: string;
    };
    weekly_workouts: WeeklyWorkout[];
}
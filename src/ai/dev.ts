
import { config } from 'dotenv';
config();

// No flows are currently active in development for this simplified feature set.
// import '@/ai/flows/generate-macronutrient-recommendations.ts';
import '@/ai/flows/suggest-diet-plan-flow.ts';

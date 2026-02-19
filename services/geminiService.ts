
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization of the Google GenAI client
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      // We don't throw here to avoid crashing the whole app, 
      // but we'll return a dummy object or handle it in calls.
      console.warn("Gemini API key is missing. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getDailyInspiration = async () => {
  try {
    const ai = getAI();
    if (!ai) return "استعن بالله ولا تعجز. سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "أعطني رسالة إيمانية محفزة قصيرة جداً وبسيطة لليوم، بأسلوب مباشر وهادئ، باللغة العربية، بدون زخرفة زائدة أو رموز تعبيرية كثيرة.",
      config: {
        systemInstruction: "أنت مساعد إيماني في تطبيق 'رحلتي إلى الجنة'. هدفك نشر التفاؤل والسكينة بكلمات بسيطة وقريبة من القلب وغير معقدة.",
        temperature: 0.7,
      },
    });
    return response.text?.trim() || "استعن بالله ولا تعجز. سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "استعن بالله ولا تعجز. سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا.";
  }
};

export const generateDailyChallenge = async (userPoints: number) => {
  try {
    const ai = getAI();
    if (!ai) {
      return {
        title: "إفشاء السلام",
        description: "سلم على 10 أشخاص اليوم من معارفك أو الغرباء بنية السنة.",
        points: 100
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `اقترح تحدي عبادة يومي بسيط (مثل سنة مهجورة، عمل صالح، ذكر محدد) لمستخدم رصيده ${userPoints} نقطة. التحدي يجب أن يكون محدداً وقابلاً للتنفيذ اليوم.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The title of the challenge",
            },
            description: {
              type: Type.STRING,
              description: "The description of the challenge",
            },
            points: {
              type: Type.NUMBER,
              description: "The points rewarded for completing the challenge",
            },
          },
          required: ["title", "description", "points"],
        },
      }
    });
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Daily Challenge Error:", error);
    return {
      title: "إفشاء السلام",
      description: "سلم على 10 أشخاص اليوم من معارفك أو الغرباء بنية السنة.",
      points: 100
    };
  }
};

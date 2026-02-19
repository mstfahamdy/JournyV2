
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyInspiration = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "أعطني رسالة إيمانية محفزة قصيرة جداً وبسيطة لليوم، بأسلوب مباشر وهادئ، باللغة العربية، بدون زخرفة زائدة أو رموز تعبيرية كثيرة.",
      config: {
        systemInstruction: "أنت مساعد إيماني في تطبيق 'رحلتي إلى الجنة'. هدفك نشر التفاؤل والسكينة بكلمات بسيطة وقريبة من القلب وغير معقدة.",
        temperature: 0.7,
      },
    });
    // Use the .text property directly as per guidelines.
    return response.text?.trim() || "استعن بالله ولا تعجز. سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "استعن بالله ولا تعجز. سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا.";
  }
};

export const generateDailyChallenge = async (userPoints: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `اقترح تحدي عبادة يومي بسيط (مثل سنة مهجورة، عمل صالح، ذكر محدد) لمستخدم رصيده ${userPoints} نقطة. التحدي يجب أن يكون محدداً وقابلاً للتنفيذ اليوم.`,
      config: {
        responseMimeType: "application/json",
        // Recommended way is to configure a responseSchema for JSON output.
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
    // Use the .text property directly.
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

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeyGenAI = process.env.YOUR_GOOGLE_GENERATIVE_AI_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { weatherData } = body;

    if (!weatherData) {
      return NextResponse.json(
        { error: "Weather data is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKeyGenAI as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      The current weather is as follows:
      - Temperature: ${weatherData.main.temp}°C
      - Weather: ${weatherData.weather[0].description}
      - Humidity: ${weatherData.main.humidity}%
      - Wind Speed: ${weatherData.wind.speed} m/s

      이 날씨를 기준으로 오늘에 적합한 복장을 제안하세요.
	  - 최대한 간단하게 입어야되는 복장을 추천해주세요.
	  - 한글로 알려주세요.
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ recommendation: result.response.text() });
  } catch (error) {
    console.error("Error generating outfit recommendation:", error);
    return NextResponse.json(
      { error: "Failed to generate outfit recommendation" },
      { status: 500 }
    );
  }
}

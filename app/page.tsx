"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [outfitRecommendation, setOutfitRecommendation] = useState<
    string | null
  >(null);

  const fetchOutfitRecommendation = async (weather: any) => {
    try {
      const response = await fetch("/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weatherData: weather }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch outfit recommendation");
      }

      const { recommendation } = await response.json();
      setOutfitRecommendation(recommendation);
    } catch (err) {
      console.error("Error fetching outfit recommendation:", err);
      setError("Failed to fetch outfit recommendation");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!navigator.geolocation || !navigator.geolocation.getCurrentPosition) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `/weather?lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch weather data");
          }
          const data = await response.json();
          setWeatherData(data);

          await fetchOutfitRecommendation(data);
        } catch (err) {
          setError("Failed to fetch weather data");
        }
      },
      () => {
        setError("Failed to get your location");
      }
    );
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="text-white">
      <h1>현재 위치의 날씨</h1>
      <p>온도: {weatherData.main.temp}°C</p>
      <p>날씨: {weatherData.weather[0].description}</p>
      <p>습도: {weatherData.main.humidity}%</p>
      <p>바람 속도: {weatherData.wind.speed} m/s</p>

      <h2>오늘의 코디 추천</h2>
      {outfitRecommendation ? (
        <p>{outfitRecommendation}</p>
      ) : (
        <div>Loading outfit recommendation...</div>
      )}
    </div>
  );
}

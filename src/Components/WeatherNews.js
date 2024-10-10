import React, { useEffect, useState } from "react";
import axios from "axios";

const WeatherNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace this with your News API key
  const API_KEY = "fb18c522773d4b869e8c24052f807239";

  const fetchWeatherNews = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=weather OR natural disasters&apiKey=${API_KEY}`
      );
      setNews(response.data.articles);
      setLoading(false);
    } catch (err) {
      setError("Error fetching news.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherNews();
  }, []);

  if (loading) {
    return <p>Loading weather news...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-md p-4 rounded-lg shadow-lg w-full mt-4">
      <h2 className="text-xl font-bold text-center mb-4">Latest Weather News</h2>
      <ul className="space-y-4">
        {news.slice(0, 5).map((article, index) => (
          <li key={index} className="border-b border-gray-300 pb-4">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              <h3 className="font-bold">{article.title}</h3>
              <p>{article.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherNews;

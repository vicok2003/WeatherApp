import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiMapPin, FiStar, FiTrash2 } from "react-icons/fi";
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiFog } from 'react-icons/wi';
import WeatherNews from "./WeatherNews";

const WeatherDashboard = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [unit, setUnit] = useState("metric"); // Metric by default

  const API_KEY = "bddd0edf1df09f63e55eca686e81d867"; // Replace with your actual API key


  const getWeatherIcon = (weatherCondition) => {
    switch (weatherCondition?.toLowerCase()) {
      case "clear":
        return <WiDaySunny size={40} color="yellow" />;
      case "rain":
        return <WiRain size={40} color="#1E90FF" />; // Sea blue color
      case "clouds":
        return <WiCloudy size={40} color="white" />;
      case "snow":
        return <WiSnow size={40} color="#F0FFFF" />; // Snow white color
      case "thunderstorm":
        return <WiThunderstorm size={40} color="grey" />;
      case "fog":
      case "mist":
        return <WiFog size={40} color="#B0C4DE" />; // Light steel blue for fog
      default:
        return <WiDaySunny size={40} color="yellow" />; // Default to sunny
    }
  };

  const fetchWeatherData = useCallback(async (city) => {
    setLoading(true);
    try {
        // First, get the coordinates of the city
        const coordsResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
        );

        const { lat, lon } = coordsResponse.data.coord;

        // Now, get the current weather data using lat and lon
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
        );

        // Set weather data received
        setWeatherData(weatherResponse.data);
        setError("");

        // Fetch the 5-day weather forecast
        const forecastResponse = await axios.get(
            `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
        );

        // Set forecast data received
        console.log(forecastResponse.data); // Debugging line
        setForecastData(forecastResponse.data);
    } catch (error) {
        // Handle errors
        setError("City not found. Please try again.");
        setWeatherData(null);
        setForecastData(null);
    } finally {
        setLoading(false);
    }
}, [unit]);


 // Handle the unit toggle and refetch weather data if a city is searched
 const handleUnitToggle = () => {
  setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  if (city) {
    fetchWeatherData(city); // Re-fetch weather data when unit changes
  }
};

  const handleSearch = (e) => {
    e.preventDefault();
    if (city) {
      fetchWeatherData(city);
    }
  };


  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherData(latitude, longitude);
      }, (error) => {
        setError("Unable to retrieve your location.");
      });
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, [fetchWeatherData]);

  const saveFavoriteCity = () => {
    if (city && !favorites.includes(city)) {
      const updatedFavorites = [...favorites, city];
      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setCity(""); // Clear the input
    }
  };

  const handleFavoriteClick = (favoriteCity) => {
    fetchWeatherData(favoriteCity);
  };

  const deleteFavoriteCity = (favoriteCity) => {
    const updatedFavorites = favorites.filter((city) => city !== favoriteCity);
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  useEffect(() => {
    getCurrentLocation(); // Fetch weather based on current location on mount
  }, [getCurrentLocation]);

  


 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 text-white p-4">
  {/* Outer Flex Container for Weather Info and Favorite Cities */}
  <div className="flex flex-col sm:flex-row items-center justify-center w-full max-w-4xl">
    {/* Weather Info Section */}
    <div className="w-full sm:w-1/2 flex flex-col items-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-md p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Weather Dashboard</h1>
      <form onSubmit={handleSearch} className="mb-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border border-white bg-white text-gray-800 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
        />
        <button
          type="submit"
          className="bg-white text-blue-600 font-semibold p-3 mt-2 rounded-lg w-full hover:bg-blue-100 transition duration-200"
        >
          Search
        </button>
      </form>

      <button
        onClick={getCurrentLocation}
        className="bg-white text-blue-600 font-semibold p-3 mt-2 rounded-lg w-full flex items-center justify-center hover:bg-blue-100 transition duration-200"
      >
        <FiMapPin className="mr-2" /> Use Current Location
      </button>

      {loading && <p className="text-lg">Loading...</p>}
      {error && <p className="text-red-300 text-lg mt-2">{error}</p>}

      {weatherData && (
        <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-md p-4 rounded-lg shadow-lg w-full max-w-md mt-4">
          <h2 className="text-xl font-bold text-center">{weatherData.name}</h2>
          <div className="flex flex-col items-center">
            <div className="weather-icon mb-2">
              {getWeatherIcon(weatherData.weather[0]?.main)}
            </div>
            <p className="text-lg">
              Current Temperature: {weatherData.main?.temp}°{unit === "metric" ? "C" : "F"}
            </p>
            <p>Weather: {weatherData.weather[0]?.description || "No description available."}</p>
            <p>Humidity: {weatherData.main?.humidity}%</p>
            <p>Wind Speed: {weatherData.wind?.speed} {unit === "metric" ? "m/s" : "mph"}</p>
          </div>

          {/* Unit Toggle Button */}
          <div className="mt-4 flex justify-center items-center">
            <label className="flex items-center mr-4">
              <input
                type="radio"
                name="unit"
                value="metric"
                checked={unit === "metric"}
                onChange={() => handleUnitToggle("metric")}
                className="dot-radio"
              />
              <span className="ml-2">Metric (°C)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="unit"
                value="imperial"
                checked={unit === "imperial"}
                onChange={() => handleUnitToggle("imperial")}
                className="dot-radio"
              />
              <span className="ml-2">Imperial (°F)</span>
            </label>
          </div>
        </div>
      )}

      <button
        onClick={saveFavoriteCity}
        className="bg-white text-blue-600 font-semibold p-3 mt-4 rounded-lg w-full flex items-center justify-center hover:bg-blue-100 transition duration-200"
      >
        <FiStar className="mr-2" /> Save as Favorite City
      </button>
    </div>

    {/* Favorite Cities Section */}
    <div className="w-full sm:w-1/2 flex flex-col items-center mt-8 sm:mt-0 sm:ml-8 gap-4 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center sm:text-left">Favorite Cities</h3>
      <div className="flex flex-col w-full">
        {favorites.length === 0 ? (
          <p>No favorite cities saved.</p>
        ) : (
          favorites.map((favoriteCity, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-30 p-3 rounded-lg flex justify-between items-center mb-2 shadow-md"
            >
              <button
                onClick={() => handleFavoriteClick(favoriteCity)}
                className="flex-grow text-left text-blue-600"
              >
                {favoriteCity}
              </button>
              <button
                onClick={() => deleteFavoriteCity(favoriteCity)}
                className="text-red-600 font-bold ml-4 hover:text-red-800 flex items-center"
              >
                <FiTrash2 className="mr-1" /> Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>

   {/* Weather News Section */}
   {forecastData && forecastData.list && (
    <div className="mt-6 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-4">Hourly Weather Forecast</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecastData.list.map((forecast) => (
                <div key={forecast.dt} className="bg-white bg-opacity-30 p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold">{new Date(forecast.dt * 1000).toLocaleString()}</h3>
                    <div className="weather-icon mb-2">
                        {getWeatherIcon(forecast.weather[0]?.main)}
                    </div>
                    <p className="text-lg">Temp: {forecast.main.temp}°{unit === "metric" ? "C" : "F"}</p>
                    <p>Weather: {forecast.weather[0]?.description || "No description available."}</p>
                </div>
            ))}
        </div>
    </div>
)}

  {/* Weather News Section */}
  <div className="w-full mt-8 sm:mt-4 flex flex-col items-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-md p-6 rounded-lg shadow-lg">
    <WeatherNews />
  </div>
</div>

  );
};


export default WeatherDashboard;

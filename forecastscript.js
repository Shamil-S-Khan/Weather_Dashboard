const API_KEY = "e95f2238b47ad7d7e2b5beb638c2448e";

document.addEventListener('DOMContentLoaded', () => {
  const getForecastBtn = document.getElementById("getForecastBtn");
  const forecastCityInput = document.getElementById("forecastCityInput");

  getForecastBtn.addEventListener("click", fetchWeatherForecast);
  forecastCityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      fetchWeatherForecast();
    }
  });
});

async function fetchWeatherForecast() {
  const city = document.getElementById("forecastCityInput").value.trim();
  const getForecastBtn = document.getElementById("getForecastBtn");
  
  if (!city) {
    showNotification("Please enter a city name", "error");
    return;
  }

  // Show loading state
  setLoadingState(true);

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City not found. Please check the city name.");
    }
    
    const data = await response.json();
    displayForecast(data);
    saveRecentSearch(city);
    showNotification("Forecast data updated successfully!", "success");
  } catch (error) {
    showNotification(error.message, "error");
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  const getForecastBtn = document.getElementById("getForecastBtn");
  const buttonText = getForecastBtn.querySelector('.button-text');
  
  if (isLoading) {
    getForecastBtn.disabled = true;
    buttonText.innerHTML = '<span class="loading"></span> Loading...';
  } else {
    getForecastBtn.disabled = false;
    buttonText.textContent = 'Get Forecast';
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type} fade-in`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function displayForecast(data) {
  const forecastResults = document.getElementById("forecastResults");
  forecastResults.innerHTML = "";

  const dailyForecasts = getDailyForecasts(data.list);

  dailyForecasts.forEach((day) => {
    const date = new Date(day.dt_txt);
    const forecastDiv = document.createElement("div");
    forecastDiv.classList.add("forecast-item", "fade-in");

    forecastDiv.innerHTML = `
      <div class="forecast-header">
        <h3>${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
        <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
      </div>
      <div class="forecast-details">
        <div class="forecast-main">
          <p class="temperature">${Math.round(day.main.temp)}°C</p>
          <p class="feels-like">Feels like: ${Math.round(day.main.feels_like)}°C</p>
          <p class="condition">${day.weather[0].description}</p>
        </div>
        <div class="forecast-info">
          <p><i class="fas fa-tint"></i> Humidity: ${day.main.humidity}%</p>
          <p><i class="fas fa-wind"></i> Wind: ${day.wind.speed} m/s</p>
          <p><i class="fas fa-compress-arrows-alt"></i> Pressure: ${day.main.pressure} hPa</p>
        </div>
      </div>
    `;

    forecastResults.appendChild(forecastDiv);
  });
}

function getDailyForecasts(forecastList) {
  const dailyForecasts = [];
  const forecastByDay = {};

  forecastList.forEach((item) => {
    const date = new Date(item.dt_txt);
    const day = date.toDateString();
    const hour = date.getHours();

    if (!forecastByDay[day] || Math.abs(hour - 12) < Math.abs(forecastByDay[day].hour - 12)) {
      forecastByDay[day] = { ...item, hour };
    }
  });

  // Sort forecasts by date
  const sortedDays = Object.keys(forecastByDay).sort((a, b) => new Date(a) - new Date(b));
  
  // Get only the next 5 days
  sortedDays.slice(0, 5).forEach(day => {
    dailyForecasts.push(forecastByDay[day]);
  });

  return dailyForecasts;
}

function saveRecentSearch(city) {
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  recentSearches = [city, ...recentSearches.filter(c => c !== city)].slice(0, 5);
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
}

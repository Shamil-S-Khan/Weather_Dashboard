const API_KEY = "e95f2238b47ad7d7e2b5beb638c2448e";

let tempBarChart;
let weatherPieChart;
let tempLineChart;

document
  .getElementById("getWeatherBtn")
  .addEventListener("click", fetchWeatherData);

async function fetchWeatherData() {
  const city = document.getElementById("cityInput").value.trim(); // Trim any extra spaces
  if (!city) {
    return alert("Please enter a city name");
  }

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const weatherResponse = await fetch(weatherUrl);

    // Check if the weather API response is OK (status code 200)
    if (!weatherResponse.ok) {
      throw new Error("City not found. Please check the city name.");
    }

    const weatherData = await weatherResponse.json();

    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
      throw new Error("Error fetching forecast data. Please try again.");
    }

    const forecastData = await forecastResponse.json();

    displayCurrentWeather(weatherData);
    displayForecastCharts(forecastData);
  } catch (error) {
    alert(error.message);
  }
}

function displayCurrentWeather(data) {
  const currentWeatherDiv = document.getElementById("currentWeather");
  const { name, main, weather } = data;

  if (!main || !weather) {
    return alert("Invalid data received. Please try another city.");
  }

  // Change the weather widget background based on weather condition
  const weatherWidget = document.querySelector(".weather-widget");
  const weatherCondition = weather[0].main.toLowerCase(); // e.g., clear, clouds, rain

  changeBackground(weatherCondition, weatherWidget);

  currentWeatherDiv.innerHTML = `
    <h3>Weather in ${name}</h3>
    <p>Temperature: ${main.temp}°C</p>
    <p>Humidity: ${main.humidity}%</p>
    <p>Condition: ${weather[0].description}</p>
  `;
}

function changeBackground(condition, widget) {
  let backgroundUrl;

  switch (condition) {
    case "clear":
      backgroundUrl = "url(clear-sky.jpeg)";
      break;
    case "clouds":
      backgroundUrl = "url(cloudy-sky.jpeg)";
      break;
    case "rain":
      backgroundUrl = "url(rainy-sky.jpeg)";
      break;
    case "snow":
      backgroundUrl = "url(snowy-sky.jpeg)";
      break;
    case "thunderstorm":
      backgroundUrl = "url(thunderstorm.jpeg)";
      break;
    default:
      backgroundUrl = "url(default-weather.jpg)"; // Use a default image if needed
  }

  widget.style.backgroundImage = backgroundUrl;
  widget.style.backgroundSize = "cover";
}

function displayForecastCharts(data) {
  const labels = data.list
    .slice(0, 5)
    .map((item) => new Date(item.dt_txt).toLocaleDateString());
  const temperatures = data.list.slice(0, 5).map((item) => item.main.temp);
  const weatherConditions = data.list
    .slice(0, 5)
    .map((item) => item.weather[0].main);

  // Destroy previous charts if they exist to allow new ones
  if (tempBarChart) tempBarChart.destroy();
  if (weatherPieChart) weatherPieChart.destroy();
  if (tempLineChart) tempLineChart.destroy();

  createBarChart(labels, temperatures);
  createDoughnutChart(weatherConditions);
  createLineChart(labels, temperatures);
}

function createBarChart(labels, data) {
  const ctx = document.getElementById("tempBarChart").getContext("2d");

  tempBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{ label: "Temperature (°C)", data: data }],
    },
    options: { animation: { delay: 1000 } },
  });
}

function createDoughnutChart(data) {
  const ctx = document.getElementById("weatherPieChart").getContext("2d");

  weatherPieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Sunny", "Cloudy", "Rainy"],
      datasets: [
        {
          data: [
            data.filter((c) => c === "Clear").length,
            data.filter((c) => c === "Clouds").length,
            data.filter((c) => c === "Rain").length,
          ],
        },
      ],
    },
    options: { animation: { delay: 1000 } },
  });
}

function createLineChart(labels, data) {
  const ctx = document.getElementById("tempLineChart").getContext("2d");

  tempLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{ label: "Temperature (°C)", data: data }],
    },
    options: { animation: { delay: 1000, easing: "easeInOutBounce" } },
  });
}

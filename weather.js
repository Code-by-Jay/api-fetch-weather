
const apiKey = "576ecef38d4c4429b7082701252107";


function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tab + "Forecast").style.display = "block";
  document.querySelector(`.tab-btn[onclick*="${tab}"]`).classList.add("active");
}

async function getWeatherByCity() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }
  cityInput.value = "";
  fetchForecast(`q=${city}`);
}

async function fetchForecast(query) {
  const loading = document.getElementById("loading");
  const todayEl = document.getElementById("todayForecast");
  const weekEl = document.getElementById("weekForecast");
  loading.style.display = "block";
  todayEl.innerHTML = "";
  weekEl.innerHTML = "";

  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&${query}&days=7&aqi=yes`;
    const res = await fetch(url);
    const data = await res.json();
    loading.style.display = "none";

    if (data.error) {
      todayEl.innerHTML = `<p style="color:red;">${data.error.message}</p>`;
      return;
    }

    const today = data.current;
    const todayHtml = `
      <h3>📍 ${data.location.name}, ${data.location.country}</h3>
      <p><img src="${today.condition.icon}"> <strong>${today.condition.text}</strong></p>
      <p>🌡️ Temp: ${today.temp_c}°C</p>
      <p>💨 Wind: ${today.wind_kph} km/h</p>
      <p>💧 Humidity: ${today.humidity}%</p>
    `;
    todayEl.innerHTML = todayHtml;

    const weekHtml = data.forecast.forecastday.map(day => `
      <div class="forecast-day">
        <h4>${day.date}</h4>
        <img src="${day.day.condition.icon}" alt="Weather">
        <p><strong>${day.day.condition.text}</strong></p>
        <p>🌡️ Max: ${day.day.maxtemp_c}°C | Min: ${day.day.mintemp_c}°C</p>
        <p>💧 Rain: ${day.day.daily_chance_of_rain}%</p>
      </div>
    `).join("");
    weekEl.innerHTML = `<div class="forecast-container">${weekHtml}</div>`;

  } catch (err) {
    loading.style.display = "none";
    todayEl.innerHTML = `<p>Error fetching weather data.</p>`;
  }
}

window.onload = () => {
  showTab('today'); // Show "today" tab by default
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        fetchForecast(`q=${latitude},${longitude}`);
      },
      err => {
        console.warn("Geolocation failed:", err.message);
        document.getElementById("todayForecast").innerHTML =
          "<p>⚠️ Location access denied. Please enter a city manually.</p>";
      }
    );
  } else {
    document.getElementById("todayForecast").innerHTML =
      "<p>Your browser does not support location services. Enter a city manually.</p>";
  }
};

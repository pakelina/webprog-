document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '0ae71d2e563a5e1913d7a52e757a6611'; // OpenWeatherMap API key
    const OPENWEATHERMAP_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
    
    const cities = [
        'Seoul',
        'Busan',
        'Incheon',
        'Daegu',
        'Daejeon',
        'Gwangju',
        'Ulsan',
        'Suwon',
        'Jeju',
    ];

    const cityDropdown = document.getElementById('cityDropdown');
    const weatherTable = document.getElementById('weatherTable');
    const barChartCanvas = document.getElementById('barChart');
    const forecastContainer = document.getElementById('forecastContainer');
    let barChartInstance = null; // Store the current chart instance

    // Populate dropdown with cities
    function populateDropdown() {
        cityDropdown.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a city...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        cityDropdown.appendChild(defaultOption);

        cities.forEach((city) => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityDropdown.appendChild(option);
        });
    }

    // Fetch and display weather data (current weather from OpenWeatherMap)
    async function fetchWeatherData(city) {
        try {
            const response = await fetch(
                `${OPENWEATHERMAP_API_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

            const data = await response.json();
            updateWeatherIndicators(data);
            displayWeatherTable(data);
            renderCharts(data);
            fetchForecastData(city); // Fetch forecast
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert(`Failed to fetch weather data: ${error.message}`);
        }
    }

    // Fetch 5-day forecast data
    async function fetchForecastData(city) {
        try {
            const response = await fetch(
                `${OPENWEATHERMAP_API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
            );
            if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

            const data = await response.json();
            displayForecast(data);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            alert(`Failed to fetch forecast data: ${error.message}`);
        }
    }

    // Update weather indicators
    function updateWeatherIndicators(data) {
        const main = data.main;
        const wind = data.wind;

        document.getElementById('temperature').textContent = `${main.temp} °C`;
        document.getElementById('humidity').textContent = `${main.humidity} %`;
        document.getElementById('windSpeed').textContent = `${wind.speed} km/h`;
    }

    // Display weather data in the table
    function displayWeatherTable(data) {
        const main = data.main;
        const weather = data.weather[0];
        const wind = data.wind;

        weatherTable.innerHTML = `
            <tr>
                <td><img src="http://openweathermap.org/img/wn/${weather.icon}.png" alt="${weather.description}" width="50"></td>
                <td>${weather.description}</td>
                <td>${main.temp} °C</td>
                <td>${main.feels_like} °C</td>
                <td>${main.humidity} %</td>
                <td>${wind.speed} km/h</td>
            </tr>
        `;
    }

    // Render charts for weather metrics
    function renderCharts(data) {
        const main = data.main;
        const wind = data.wind;

        if (barChartInstance) {
            barChartInstance.destroy();
        }

        barChartInstance = new Chart(barChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Temperature (°C)', 'Feels Like (°C)', 'Humidity (%)', 'Wind Speed (km/h)'],
                datasets: [
                    {
                        label: 'Weather Metrics',
                        data: [main.temp, main.feels_like, main.humidity, wind.speed],
                        backgroundColor: ['#f54242', '#f5a142', '#42a7f5', '#42f56b'],
                        borderColor: ['#d93434', '#d98f34', '#348dd9', '#34d94c'],
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                animation: {
                    onComplete: () => {
                      delayed = true;
                    },
                    delay: (context) => {
                      let delay = 0;
                      if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 300 + context.datasetIndex * 100;
                      }
                      return delay;
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                        },
                    },
                },
            },
        });
    }

   // Display the 5-day forecast
   function displayForecast(data) {
    forecastContainer.innerHTML = ''; 

    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const forecastDiv = document.createElement('div');
        forecastDiv.classList.add('forecast');
        forecastDiv.innerHTML = `
            <h3>${day}</h3>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}" width="50">
            <p>${forecast.weather[0].description}</p>
            <p>Temp: ${forecast.main.temp} °C</p>
            <p>Feels Like: ${forecast.main.feels_like} °C</p>
            <p>Humidity: ${forecast.main.humidity} %</p>
            <p>Wind Speed: ${forecast.wind.speed} km/h</p>
        `;
        forecastContainer.appendChild(forecastDiv);
    }
}

// Get user's geolocation and set default city
function getUserGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherDataByCoords(lat, lon);
            },
            () => {
                // If geolocation fails or is denied, default to Seoul
                console.log('Geolocation failed, using default city: Seoul');
                fetchWeatherData('Seoul');
            }
        );
    } else {
        console.log('Geolocation is not supported by this browser, using default city: Seoul');
        fetchWeatherData('Seoul');
    }
}

// Fetch weather data by coordinates
async function fetchWeatherDataByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${OPENWEATHERMAP_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

        const data = await response.json();
        updateWeatherIndicators(data);
        displayWeatherTable(data);
        renderCharts(data);
        fetchForecastDataByCoords(lat, lon); // Fetch forecast
    } catch (error) {
        console.error('Error fetching weather data by coordinates:', error);
        alert(`Failed to fetch weather data: ${error.message}`);
    }
}

// Fetch 5-day forecast data by coordinates
async function fetchForecastDataByCoords(lat, lon) {
    try {
        const response = await fetch(
            `${OPENWEATHERMAP_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);

        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Error fetching forecast data by coordinates:', error);
        alert(`Failed to fetch forecast data: ${error.message}`);
    }
}

// Event listener for dropdown
cityDropdown.addEventListener('change', (event) => {
    const selectedCity = event.target.value;
    if (selectedCity) {
        fetchWeatherData(selectedCity);
    }
});

// Initialize the page
populateDropdown();
getUserGeolocation();
});


const apiKey = '27803163eb13b8bbb98e6a5c56f7da5b'; 
// Mapping cities to their coordinates
const cityCoordinates = {
    'Seoul': { lat: 37.5665, lon: 126.978 },
    'Busan': { lat: 35.1796, lon: 129.0756 },
    'Incheon': { lat: 37.4563, lon: 126.7052 },
    'Daegu': { lat: 35.8714, lon: 128.6014 },
    'Daejeon': { lat: 36.3504, lon: 127.3845 },
    'Gwangju': { lat: 35.1595, lon: 126.8526 },
    'Ulsan': { lat: 35.5395, lon: 129.3114 },
    'Suwon': { lat: 37.2636, lon: 127.0286 },
    'Jeju': { lat: 33.4996, lon: 126.5312 }
};

let comparisonChart = null;  // Store the chart instance globally

document.getElementById('compareButton').addEventListener('click', fetchComparisonData);

async function fetchComparisonData() {
    const city1 = document.getElementById('cityChoice1').value;
    const city2 = document.getElementById('cityChoice2').value;

    const coords1 = cityCoordinates[city1];
    const coords2 = cityCoordinates[city2];

    if (!coords1 || !coords2) {
        alert("Please select valid cities for comparison.");
        return;
    }

    const parametersToCompare = getSelectedParameters();
    if (parametersToCompare.length === 0) {
        alert("Please select at least one parameter to compare.");
        return;
    }

    try {
        const [weatherData1, weatherData2] = await Promise.all([
            fetchWeatherData(coords1),
            fetchWeatherData(coords2)
        ]);

        // If there's an existing chart, destroy it
        if (comparisonChart) {
            comparisonChart.destroy();
        }

        // Update chart with comparison data
        updateComparisonChart(weatherData1, weatherData2, parametersToCompare);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Error fetching weather data.");
    }
}

// Fetch weather data for a city
async function fetchWeatherData(coords) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Get selected weather parameters to compare
function getSelectedParameters() {
    const selectedParameters = [];
    if (document.getElementById('compareTemp').checked) selectedParameters.push('temp');
    if (document.getElementById('compareHumidity').checked) selectedParameters.push('humidity');
    if (document.getElementById('comparePressure').checked) selectedParameters.push('pressure');
    if (document.getElementById('compareWind').checked) selectedParameters.push('windSpeed');
    if (document.getElementById('compareCloudiness').checked) selectedParameters.push('cloudiness');
    if (document.getElementById('compareRain').checked) selectedParameters.push('rain');
    if (document.getElementById('compareSnow').checked) selectedParameters.push('snow');

    return selectedParameters;
}

// Update the comparison chart with the selected parameters
function updateComparisonChart(data1, data2, parametersToCompare) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    const labels = [];
    const dataset1 = [];
    const dataset2 = [];

    parametersToCompare.forEach(parameter => {
        labels.push(parameter.charAt(0).toUpperCase() + parameter.slice(1));
        dataset1.push(getParameterValue(data1, parameter));
        dataset2.push(getParameterValue(data2, parameter));
    });

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: data1.name,
                    data: dataset1,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: data2.name,
                    data: dataset2,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Get the value for a specific weather parameter
function getParameterValue(data, parameter) {
    switch (parameter) {
        case 'temp':
            return data.main.temp;
        case 'humidity':
            return data.main.humidity;
        case 'pressure':
            return data.main.pressure;
        case 'windSpeed':
            return data.wind.speed;
        case 'cloudiness':
            return data.clouds.all;
        case 'rain':
            return data.rain ? data.rain['1h'] : 0;
        case 'snow':
            return data.snow ? data.snow['1h'] : 0;
        default:
            return 0;
    }
}

// Change navbar style on scroll
window.onscroll = function() {
    changeNavbarStyle();
};

function changeNavbarStyle() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Display Button click event handler
document.getElementById("displayButton").addEventListener("click", function() {
    const city = document.getElementById("citySelector").value;
    fetchAirQualityData(city);
});



async function fetchWeatherAlerts() {
    const apiKey = "5b2b2cfa2ff34dd982f132231240212"; // Replace with your WeatherAPI key
    const koreaLocation = "South Korea";

    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(koreaLocation)}&days=1&alerts=yes`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log("WeatherAPI Alerts Response:", data); // Debugging the API response

        if (data.alerts && data.alerts.alert.length > 0) {
            displayWeatherAlerts(data.alerts.alert);
        } else {
            document.getElementById("alertsContainer").innerHTML = "<p>No active weather alerts for Korea.</p>";
        }
    } catch (error) {
        console.error("Error fetching weather alerts:", error);
        document.getElementById("alertsContainer").innerHTML = "<p>Error fetching weather alerts. Please try again later.</p>";
    }
}

function displayWeatherAlerts(alerts) {
    const container = document.getElementById("alertsContainer");
    container.innerHTML = ""; // Clear existing alerts

    alerts.forEach(alert => {
        const alertDiv = document.createElement("div");
        alertDiv.classList.add("alert");

        alertDiv.innerHTML = `
            <h3>${alert.headline}</h3>
            <p><strong>Severity:</strong> ${alert.severity}</p>
            <p><strong>Effective:</strong> ${new Date(alert.effective).toLocaleString()}</p>
            <p><strong>Expires:</strong> ${new Date(alert.expires).toLocaleString()}</p>
            <p>${alert.desc}</p>
        `;

        container.appendChild(alertDiv);
    });
}

document.getElementById("fetchAlertsButton").addEventListener("click", fetchWeatherAlerts);



const API_KEY = '27803163eb13b8bbb98e6a5c56f7da5b'; 
const cityC = {
    seoul: { lat: 37.5665, lon: 126.9780 },
    busan: { lat: 35.1796, lon: 129.0756 },
    incheon: { lat: 37.4563, lon: 126.7052 },
    daegu: { lat: 35.8714, lon: 128.6014 },
    daejeon: { lat: 36.3504, lon: 127.3845 },
    gwangju: { lat: 35.1595, lon: 126.8526 },
    ulsan: { lat: 35.5384, lon: 129.3114 },
    suwon: { lat: 37.2636, lon: 127.0286 },
    jeju: { lat: 33.4996, lon: 126.5312 }
};

const airQualityLevels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
const displayButton = document.getElementById('displayButton');
const airQualityWidgets = document.getElementById('airQualityWidgets');
const aqiChartCtx = document.getElementById('aqiChart').getContext('2d');
let aqiChart; // Chart instance

displayButton.addEventListener('click', async () => {
    const selectedCity = document.getElementById('citySelect').value;
    const { lat, lon } = cityC[selectedCity];

    try {
        // Fetch air quality data
        const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await response.json();
        const aqi = data.list[0].main.aqi;
        const pollutants = data.list[0].components;

        // Display widgets
        airQualityWidgets.innerHTML = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">PM2.5</h5>
                        <p class="card-text">${pollutants.pm2_5} µg/m³</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">PM10</h5>
                        <p class="card-text">${pollutants.pm10} µg/m³</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">CO</h5>
                        <p class="card-text">${pollutants.co} µg/m³</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">NO</h5>
                        <p class="card-text">${pollutants.no} µg/m³</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">O₃</h5>
                        <p class="card-text">${pollutants.o3} µg/m³</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">SO₂</h5>
                        <p class="card-text">${pollutants.so2} µg/m³</p>
                    </div>
                </div>
            </div>
        `;

        // Update Doughnut Chart
        if (aqiChart) aqiChart.destroy(); // Destroy previous chart if exists
        aqiChart = new Chart(aqiChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'],
                datasets: [{
                    data: airQualityLevels.map((_, i) => (i + 1 === aqi ? 100 : 20)),
                    backgroundColor: ['#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#8e44ad']
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { label: (context) => context.label + ": " + context.raw + "%" } }
                },
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        airQualityWidgets.innerHTML = `<p class="text-danger">Error fetching air quality data. Please try again later.</p>`;
        console.error(error);
    }
});

const apiK = '27803163eb13b8bbb98e6a5c56f7da5b'; 
const cities = {
    seoul: { lat: 37.5665, lon: 126.9780 },
    busan: { lat: 35.1796, lon: 129.0756 },
    incheon: { lat: 37.4563, lon: 126.7052 },
    daegu: { lat: 35.8714, lon: 128.6014 },
    daejeon: { lat: 36.3504, lon: 127.3845 },
    gwangju: { lat: 35.1595, lon: 126.8526 },
    ulsan: { lat: 35.5384, lon: 129.3114 },
    suwon: { lat: 37.2636, lon: 127.0286 },
    jeju: { lat: 33.4996, lon: 126.5312 }
};

let map; // Map instance
let rainLayer; // Rain layer instance

// Function to initialize the map
function initializeMap() {
    document.getElementById('mapContainer').style.display = 'block';

    if (!map) {
        map = L.map('map').setView([37.5665, 126.9780], 7); // Default: Seoul

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        Object.keys(cities).forEach((city) => {
            const { lat, lon } = cities[city];
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`<strong>${city.charAt(0).toUpperCase() + city.slice(1)}</strong><br>Click for rain data.`)
                .on('click', () => updateRainLayer(lat, lon));
        });
    }
}

async function updateRainLayer(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiK}`
        );
        const data = await response.json();
        const precipitation = data.rain ? data.rain['1h'] : 0;

        if (rainLayer) {
            map.removeLayer(rainLayer);
        }

        rainLayer = L.circle([lat, lon], {
            radius: precipitation * 10000, 
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.5
        }).bindPopup(`<strong>${data.name || "Selected Location"}</strong><br>Rain: ${precipitation} mm/hr`).addTo(map);

        map.setView([lat, lon], 10);
    } catch (error) {
        console.error("Error fetching precipitation data:", error);
    }
}

document.getElementById('showMapButton').addEventListener('click', initializeMap);


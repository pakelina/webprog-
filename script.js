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

    // Event listener for dropdown
    cityDropdown.addEventListener('change', (e) => {
        const selectedCity = e.target.value;
        if (selectedCity) fetchWeatherData(selectedCity);
    });

    // Initialize dropdown and load default city
    populateDropdown();
    fetchWeatherData('Seoul');
});

const apiKey = '0ae71d2e563a5e1913d7a52e757a6611'; 
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

let airQualityChart; // To store the chart instance

// Function to fetch air quality data
async function fetchAirQualityData(city) {
    const apiKey = "27803163eb13b8bbb98e6a5c56f7da5b";
    const cityCoordinates = {
        'Seoul': { lat: 37.5665, lon: 126.978 },
        'Busan': { lat: 35.1796, lon: 129.0756 },
        'Incheon': { lat: 37.4563, lon: 126.7052 },
        'Daegu': { lat: 35.868, lon: 128.601 },
        'Daejeon': { lat: 36.3504, lon: 127.3845 },
        'Gwangju': { lat: 35.1595, lon: 126.8526 },
        'Ulsan': { lat: 35.5383, lon: 129.3114 },
        'Suwon': { lat: 37.2636, lon: 127.0286 },
        'Jeju': { lat: 33.4996, lon: 126.5312 }
    };

    const coordinates = cityCoordinates[city];
    const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if the data structure is valid
        if (data && data.list && data.list[0] && data.list[0].components) {
            // Populate the widgets
            document.getElementById("aqiValue").textContent = data.list[0].main.aqi || "N/A";
            document.getElementById("pm25Value").textContent = data.list[0].components.pm2_5 || "N/A";
            document.getElementById("pm10Value").textContent = data.list[0].components.pm10 || "N/A";
            document.getElementById("no2Value").textContent = data.list[0].components.no2 || "N/A";

            // Update the chart with the fetched data
            updateAirQualityChart(data.list[0].components);
        } else {
            throw new Error("Invalid data structure returned from API.");
        }
    } catch (error) {
        console.error("Error fetching air quality data:", error);
        alert("Error fetching air quality data. Please try again.");
    }
}

// Function to update the air quality chart
function updateAirQualityChart(components) {
    const ctx = document.getElementById('airQualityChart').getContext('2d');

    // Data for the chart based on fetched components
    const chartData = {
        labels: ['PM2.5', 'PM10', 'NO2', 'O3', 'CO', 'SO2'],
        datasets: [{
            label: 'Air Quality Components',
            data: [
                components.pm2_5 || 0,
                components.pm10 || 0,
                components.no2 || 0,
                components.o3 || 0,
                components.co || 0,
                components.so2 || 0
            ],
            backgroundColor: ['#ff6b6b', '#ffb142', '#1e90ff', '#32cd32', '#f0e68c', '#8a2be2'],
            borderColor: ['#ff6b6b', '#ffb142', '#1e90ff', '#32cd32', '#f0e68c', '#8a2be2'],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    // Destroy the previous chart if it exists
    if (airQualityChart) {
        airQualityChart.destroy();
    }

    // Create a new chart
    airQualityChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: chartOptions
    });
    
}

// Call fetchAirQualityData when "Display" button is clicked
document.getElementById("displayButton").addEventListener("click", function() {
    const selectedCity = document.getElementById("citySelect").value;
    fetchAirQualityData(selectedCity);
});

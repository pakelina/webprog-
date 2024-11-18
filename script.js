document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '115dff860a0b5678692b6b13c5f74987'; // Replace with your Weatherstack API key
    const API_BASE_URL = 'http://api.weatherstack.com/current';
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
    let barChartInstance; // Variable to store the current chart instance

    // Populate dropdown with cities
    cities.forEach((city) => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });

    // Fetch and display weather data
    async function fetchWeatherData(city) {
        try {
            const response = await fetch(
                `${API_BASE_URL}?access_key=${API_KEY}&query=${encodeURIComponent(city)}`
            );
            if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(`Error: ${data.error.info}`);
            }

            displayWeatherTable(data);
            renderCharts(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert(`Failed to fetch data: ${error.message}`);
        }
    }

    // Display weather data in the table
    function displayWeatherTable(data) {
        const current = data.current;
        weatherTable.innerHTML = `
            <tr>
                <td><img src="${current.weather_icons[0]}" alt="${current.weather_descriptions[0]}" width="50"></td>
                <td>${current.weather_descriptions[0]}</td>
                <td>${current.temperature}</td>
                <td>${current.feelslike}</td>
                <td>${current.humidity}</td>
                <td>${current.wind_speed}</td>
            </tr>
        `;
    }

    // Render charts (e.g., temperature, humidity)
    function renderCharts(data) {
        const current = data.current;

        // Destroy the existing chart instance if it exists
        if (barChartInstance) {
            barChartInstance.destroy();
        }

        // Create a new chart instance
        barChartInstance = new Chart(barChartCanvas, {
            type: 'bar',
            data: {
                labels: ['Temperature', 'Feels Like', 'Humidity', 'Wind Speed'],
                datasets: [
                    {
                        label: 'Weather Metrics',
                        data: [current.temperature, current.feelslike, current.humidity, current.wind_speed],
                        backgroundColor: ['red', 'orange', 'blue', 'green'],
                    },
                ],
            },
        });
    }

    // Event listener for dropdown
    cityDropdown.addEventListener('change', (e) => {
        const selectedCity = e.target.value;
        if (selectedCity) fetchWeatherData(selectedCity);
    });

    // Load default city (Seoul) on page load
    fetchWeatherData('Seoul');
});

$(document).ready(function () {

    // MY Personal OpenWeather API key.
    const apiKey = 'd96eaa93b402b86cc39119d34076f8b0';

    // Selectors for HTML elements to display weather information
    var cityEl = $('h2#city');
    var dateEl = $('h3#date');
    var weatherIconEl = $('img#weather-icon');
    var temperatureEl = $('span#temperature');
    var humidityEl = $('span#humidity');
    var windEl = $('span#wind');
    var uvIndexEl = $('span#uv-index');
    var cityListEl = $('div.cityList');
    var cityInput = $('#city-input');

    // local storage funtions
    function loadCities() {
        var storedCities = JSON.parse(localStorage.getItem('pastCities'));
        if (storedCities) {
            pastCities = storedCities;
        }
    }
    function storeCities() {
        localStorage.setItem('pastCities', JSON.stringify(pastCities));
    }
    let pastCities = [];

   // Functions for the OpenWeather API call
    function openWeatherInput(city) {
        if (city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function openWeatherId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }

     //display recently searched cities(5)
     function displayCities(pastCities) {
        cityListEl.empty();
        pastCities.splice(5);
        let sortedCities = [...pastCities];
        sortedCities.forEach(function (location) {
            let cityDiv = $('<div>').addClass('col-12 city');
            let cityBtn = $('<button>').addClass('btn btn-light city-btn').text(location.city);
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        });
    }
    
    
    function searchWeather(queryURL) {
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {
            
            // Store current city in past cities
            let city = response.name;
            let id = response.id;
            // Remove duplicate cities
            if (pastCities[0]) {
                pastCities = $.grep(pastCities, function (storedCity) {
                    return id !== storedCity.id;
                })
            }
            pastCities.unshift({ city, id });
            storeCities();
            displayCities(pastCities);
            
            // Display current weather in DOM elements
            cityEl.text(response.name);
            let formattedDate = moment.unix(response.dt).format('L');
            dateEl.text(formattedDate);
            let weatherIcon = response.weather[0].icon;
            weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
            temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humidityEl.text(response.main.humidity);
            windEl.text((response.wind.speed * 2.237).toFixed(1));
            
            // Call OpenWeather API with lat and lon to get the UV index and 5 day forecast
            let lat = response.coord.lat;
            let lon = response.coord.lon;
            let queryURLAll = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            $.ajax({
                url: queryURLAll,
                method: 'GET'
            }).then(function (response) {
                let uvIndex = response.current.uvi;
                let uvColor = setUVIndexColor(uvIndex);
                uvIndexEl.text(response.current.uvi);
                uvIndexEl.attr('style', `background-color: ${uvColor}; color: ${uvColor === "yellow" ? "black" : "white"}`);
                let fiveDay = response.daily;
                
                // For loop to Display the 5 day forecast in the HTML/DOM
                for (let i = 0; i <= 5; i++) {
                    let currDay = fiveDay[i];
                    $(`div.day-${i} .card-title`).text(moment.unix(currDay.dt).format('L'));
                    $(`div.day-${i} .fiveDay-img`).attr(
                        'src',
                        `http://openweathermap.org/img/wn/${currDay.weather[0].icon}.png`
                        ).attr('alt', currDay.weather[0].description);
                        $(`div.day-${i} .fiveDay-temp`).text(((currDay.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                        $(`div.day-${i} .fiveDay-humid`).text(currDay.humidity);
                    }
                });
            });
        }
        //function to set color for the generated UV index
        function setUVIndexColor(uvi) {
            if (uvi < 3) {
                return 'green';
            } else if (uvi >= 3 && uvi < 6) {
                return 'yellow';
            } else if (uvi >= 6 && uvi < 8) {
                return 'orange';
            } else if (uvi >= 8 && uvi < 11) {
                return 'red';
            } else return 'purple';
        }
        // Click handler for search button
        $('#search-btn').on('click', function (event) {
            // Preventing the button from trying to submit the form
            event.preventDefault();
            let city = cityInput.val().trim();
            city = city.replace(' ', '%20');
            cityInput.val('');
            
            //generate the city and weather query with default set to my home city "cleveland"
            if (city) {
                let queryURL = openWeatherInput(city);
                searchWeather(queryURL);
            } else {
                let queryURL = openWeatherInput("cleveland");
                searchWeather(queryURL);
            }
        }); 
        
        // Click handler for city buttons to load that city's weather
        $(document).on("click", "button.city-btn", function (event) {
            let clickedCity = $(this).text();
            let foundCity = $.grep(pastCities, function (storedCity) {
                return clickedCity === storedCity.city;
            })
            let queryURL = openWeatherId(foundCity[0].id)
            searchWeather(queryURL);
        });
        
        loadCities();
        displayCities(pastCities);
        
    });
  
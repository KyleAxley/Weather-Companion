$(document).ready(function () {

    // My OpenWeather generated API key
    const apiKey = 'd96eaa93b402b86cc39119d34076f8b0';


    //local storage for saved city searches. 
    function loadCities() {
        var storedCity = JSON.parse(localStorage.getItem ("savedCities"));
        if (storedCity) {
            savedCities = storedCity;
        }
    }

    let savedCities = [];

    function storeCities() {
        localStorage.setItem('savedCities', JSON.stringify(pastCities));
    }

    //Open Weather API functions. 
    function openWeatherInputs(city) {
        if(city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function openWeatherFormId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }


    function displayCities(savedCities) {
        cityListEl.empty();
        savedCities.splice(5);
        var sortedCities = [...savedCities];
        sortedCities.forEach(function (location) {
            var cityDiv = $('<div>').addClass('col-12 city');
            var cityBtn = $('<button>').addClass('btn btn-light city-btn').text(location.city);
            cityListEl.append(cityDiv);
        });
    }

    function searchWeather(queryURL) {
        $ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {
            let city = response.name;
            let id = response.id;
            
            if (pastCities[0]) {
                pastCities = $.grep(savedCities, function (storedCity) {
                    return id !== storedCity.id;
                })
            }
            pastCities.unshift({ city, id});
            storeCities();
            displayCities(pastCities);
        })
    }
});
$(document).ready(function () {

    // My OpenWeather generated API key
    const apiKey = 'd96eaa93b402b86cc39119d34076f8b0';

    
    function openWeatherInputs(city) {
        if(city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function openWeatherFormId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }



    function searchWeather(queryURL) {
        $ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {
            let city = response.name;
            let id = response.id;
            
            if (pastCities[0]) {
                pastCities = $.grep(pastCitites, function (storedCity) {
                    return id !== storedCity.id;
                })
            }
            pastCities.unshift({ city, id});
            storeCities();
            displayCities(pastCities);
        })
    }
});
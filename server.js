'use strict';

const express = require('express');

const superagent = require('superagent');

const cors = require('cors');

 require('dotenv').config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());


app.get('/location', (request, response) => {
    const locationData = searchToLatLong(request.query.data);
    response.send(locationData);
});

app.get('/weather', (request, response) => {
    const weatherData = searchWeather(request.query.data);
    response.send(weatherData);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//searches for city information on google
function searchToLatLong(query) {
    const geoData = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
    return superagent.get(geoData)
        .then(response =>{
            return new Location(query, response);
        })
        .catch(error => handleError(error));
};

//constructor for location information
function Location(query, response){
    this.formatted_query = data.results[0].formatted_address;
    this.latitude = data.results[0].geometry.location.lat;
    this.longitude = data.results[0].geometry.location.lng;
}
//searches for weather of the location using the long and lat from google
function searchWeather(query){
    const newWeatherData = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
   
    return superagent.get(newWeatherData)
        .then(response => {
            return new Location(query, response);
        })
        .catch(error => handleError(error));
};

//constructor for weather data
function Weather(data) {
    let arr = [];
    for(let i = 0; i < data.daily.data.length;i++){
        const daily = data.daily.data[i].summary;
        const time = data.daily.data[i].time;
        const convertThisDate = new Date(time * 1000);
        const asAString = convertThisDate.toLocaleDateString('en-US', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'});
        console.log(asAString);
        let weatherData = {time: asAString, forecast: daily };
        arr.push(weatherData);    
    }
        return arr; 
}

function searchMovie(query){
    const movieData = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${query}`;
    return superagent.get(movieData)
        .then(response => {
           return response.body.results.forEach(movie => new MovieData(movie));
        })
        .catch(error => handleError(error));    
}

function MovieData(movie){
    this.title = movie.title;
    this.released_on = movie.release_date;
    this.total_votes = movie.vote_count;
    this.average_votes = movie.vote_average;
    this.popularity = movie.popularity;
    this.image_url = movie.poster_path; 
    this.overview = movie.overview;

}

function handleError(err, response){
    console.error(err);
    if(response) response.status(500).send('Something broke, fam.');
}
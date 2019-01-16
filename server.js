'use strict';

const express = require('express');

const superagent = require('superagent');

const cors = require('cors');

 require('dotenv').config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());


app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => handleError(error));
});

app.get('/weather', searchWeather);

app.get('/movies', searchMovie);

app.get('/yelp', searchYelp);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//searches for city information on google
function searchToLatLong(query) {
    const geoData = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
    return superagent.get(geoData)
        .then(response => {
            return new Location(query, response);
        })
        .catch(error => handleError(error));
};

//constructor for location information
function Location(query, response){
    //console.log(response.body);
    this.formatted_query = response.body.results[0].formatted_address;
    this.latitude = response.body.results[0].geometry.location.lat;
    this.longitude = response.body.results[0].geometry.location.lng;
    this.search_query = query;
}

//searches for weather of the location using the long and lat from google
function searchWeather(request, response){
    
    const newWeatherData = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
   
    return superagent.get(newWeatherData)
        .then(result => {
            
            const weatherData = result.body.daily.data.map( day =>{
                return new Weather(day);
            
            })
            response.send(weatherData);
        })
        .catch(error => handleError(error));
};

//constructor for weather data
function Weather(data) {
        const daily = data.summary;
        const time = data.time;
        const convertThisDate = new Date(time * 1000);
        const asAString = convertThisDate.toLocaleDateString('en-US', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'});
        let weatherDataArr = {time: asAString, forecast: daily };
       return weatherDataArr
}

function searchMovie(request, response){
    const movieData = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request}`;
    return superagent.get(movieData)
        .then(result => {
          
            const movieInfo = result.body.results.map(movie => {
                return new MovieData(movie);
            })
            response.send(movieInfo); 
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
function searchYelp(request, response){
    const yelpData = `https://api.yelp.com/v3/businesses/search?latitude=${request.query.data.latitude}&longitude=${request.query.data.longitude}`
    return superagent.get(yelpData)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(result =>{
            const yelpReviews = result.body.businesses.map(yelp =>{
                return new YelpReview(yelp);
            })
            response.send(yelpReviews)
    
        })
        .catch(error => handleError(error));
    }
        
function YelpReview(yelp){
    this.url = yelp.url;
    this.name = yelp.name;
    this.rating = yelp.rating;
    this.price = yelp.price;
    this.image_url = yelp.image_url;
}


function handleError(err, response){
    console.error(err);
    if(response) response.status(500).send('Something broke, fam.');
}
const express = require('express');
const app = express.Router();
const { models: { Movie, Theater, Customer, Movie_Theater, Purchase } } = require('../db')


app.get("/admin/:id", async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findByPk(movieId);
    const purchasesByTheater = await Purchase.groupByUniqueTheater(movieId);
    res.render("admin-movie", {
    movie, purchasesByTheater
    });
  } catch (e) {
    next(e);
  }
});

app.get("/:id", async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const movie = await Movie.findAll({
      where: {
        id: movieId,
      },
    });
    const theatersByMovie = await Movie_Theater.groupBy('movie');
    const theatersShowingMovie = theatersByMovie[movieId];
    res.render("movie", {
      movie,
      theatersShowingMovie,
    });
  } catch (e) {
    next(e);
  }
});

app.get("/", async (req, res, next) => {
  try {
    const movies = await Movie.findAll();
    res.render("movies", {
      movies,
    });
  } catch (e) {
    next(e);
  }
});


module.exports = app; 
const express = require('express');
const app = express.Router();
const {
  models: { Movie, Theater, Customer, Movie_Theater, Purchase },
} = require("../db");


app.get("/admin/:id", async (req, res, next) => {
  try {
      const theaterId = req.params.id;
      const theater = await Theater.findByPk(theaterId)
      const purchasesByMovie = await Purchase.groupByUniqueMovie(theaterId)
      res.render("admin-theater", {
          purchasesByMovie,
          theater
      });
        } catch (e) {
    next(e);
  }
});

app.get("/:id", async (req, res, next) => {
  try {
    const theaterId = req.params.id;
    const theater = await Theater.findAll({
      where: {
        id: theaterId,
      },
    });
    const moviesByTheaters = await Movie_Theater.groupBy('theater');
    const moviesShowingInTheater = moviesByTheaters[theaterId];
    res.render("theater", {
      theater,
      moviesShowingInTheater,
    });
      
  } catch (e) {
    next(e);
  }
});

app.get('/', async (req, res, next) => {
    try {
        const theaters = await Theater.findAll();
        res.render('theaters', {
            theaters
        })
    } catch (e) {
        next(e)
    }
} )


module.exports =app
ANC Theaters wants to create an internal directory that shows: 
-- a directory of theaters in their operation (GET /theaters)
-- a directory of movies they're showing in ALL theaters (GET /movies)
-- a directory of movies they're showing in EACH theater (GET /theaters/:id)
-- a directory of theaters showing EACH movie (GET /movies/:id)
-- an internal admin-only view showing all purchases made at a theater, grouped by movie (GET /theaters/admin/:id)
-- an interanl admin-only view showing all purchases made for a movie, grouped by theater (GET /movies/admin/:id)

-- /anc-data-schema.png shows a visual of the data schema at hand 
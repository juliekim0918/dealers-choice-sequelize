# H1 ANC Theaters Internal Directory 

### H3 ANC Theaters wants to create an internal directory that shows
- a directory of theaters in their operation (GET /theaters)
- a directory of movies they're showing in ALL theaters (GET /movies)
- a directory of movies they're showing in EACH theater (GET /theaters/:id)
- a directory of theaters showing EACH movie (GET /movies/:id)
- an internal admin-only view showing all purchases made at a theater, grouped by movie (GET /theaters/admin/:id)
- an interanl admin-only view showing all purchases made for a movie, grouped by theater (GET /movies/admin/:id)

### H# Data Schema
#### H4 /anc-data-schema.png shows a visual of the data schema at hand 
- There are 3 separate entities: Customer, Movie, and Theater 
- Movie_Theater is a join table that depicts the many-to-many relationship between Movie and Theater entities
- Purchase is a join table that depicts the many-to-many relationship amongst Customer, Movie, and Theater entities 
const {
  db,
  syncAndSeed,
  models: { Customer, Theater, Movie, Purchase, Movie_Theater }
} = require("./db");
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use('/movies', require('./routes/movies'))
app.use('/theaters', require('./routes/theaters'))


app.use('/', async (req, res, next) => {
    res.render('index')
})

const init = async() => {
    try {
        await syncAndSeed();
        const port = process.env.PORT || 3000
        app.listen(port, () => {`listening in on port ${port}`})
        
    } catch (e) {
        console.log(e)
    }
}

init();
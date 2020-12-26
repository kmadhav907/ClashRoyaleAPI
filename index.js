import express from 'express'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import bodyParser from 'body-parser'
import asyncHandler from 'express-async-handler'

dotenv.config()

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('public'))
let fav = { favCard: null, name: null, arena: null }
const baseURL = 'https://api.clashroyale.com/v1'
const endpoint = '/players/%23'

app.get('/', function (req, res) {
  res.render('Form')
})

app.post(
  '/',
  asyncHandler(async (req, res) => {
    const players = req.body.playertag
    if (players && players.includes('#')) {
      let playertag = players.split('#')
      try {
        await fetch(baseURL + endpoint + playertag[1], {
          headers: { Authorization: `Bearer ${process.env.API_KEY}` },
        })
          .then((response) => response.json())
          .then((json) => {
            if (json['reason'] === 'notFound') {
              res.redirect('/notfound')
            } else {
              let name = json['name']
              let favCard = json['currentFavouriteCard']
              let arena = json['arena']
              //console.log(json['arena'])
              //res.send(JSON.stringify(json))
              fav = { favCard, name, arena }
              res.redirect('/result')
            }
          })
      } catch (error) {
        console.log(error)
      }
    } else {
      res.redirect('/notfound')
    }
  })
)

app.get('/result', function (req, res) {
  res.render('Result', { fav: fav })
})

app.get('/notfound', function (req, res) {
  res.render('NotFound')
})

app.listen(process.env.PORT || 5000, console.log(`Server running in 3000`))

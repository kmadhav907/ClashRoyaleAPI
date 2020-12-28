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
let fav = null
let cards = null
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
              let explevel = json['expLevel']
              let trophies = json['trophies']
              let bestTrophies = json['bestTrophies']
              let battleCount = json['battleCount']
              let wins = json['wins']
              let losses = json['losses']
              let threeCrowns = json['threeCrownWins']

              let battleHistroy = {
                explevel,
                trophies,
                bestTrophies,
                battleCount,
                wins,
                losses,
                threeCrowns,
              }

              cards = json['cards']

              fav = { favCard, name, arena, battleHistroy }
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
  if (fav === null) {
    res.redirect('/')
  }
  res.render('Result', { fav: fav })
})

app.get('/cards', function (req, res) {
  if (cards === null) {
    res.redirect('/')
  }
  res.render('Cards', { cards: cards })
})

app.get('/notfound', function (req, res) {
  res.render('NotFound')
})

app.listen(3000, console.log(`Server running in 3000`))

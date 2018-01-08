const express = require('express')
const router = express.Router()
const http = require('axios')
const DialogflowApp = require('actions-on-google').DialogflowApp
const {RichResponse, BasicCard} = require('actions-on-google/response-builder')

const INPUT_WELCOME = 'input.welcome'
const INPUT_LOCATION = 'input.location'

router.post('/', function (req, res) {
  const app = new DialogflowApp({request: req, response: res})

  switch (app.getIntent()) {
    case INPUT_WELCOME:
      app.ask('Hello, what can I do for you?')
      break
    case INPUT_LOCATION:
      try {
        http.get('http://api.open-notify.org/iss-now.json')
          .then(response => {
            const position = response.data.iss_position
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`
            const message = `The space station is currently at ${position.latitude} degrees latitude and ${position.longitude} degrees longitude.`
            const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${position.latitude},${position.longitude}&zoom=1&size=600x300&maptype=roadmap&markers=color:red%7C${position.latitude},${position.longitude}`

            const card = new BasicCard()
              .setTitle('International Space Station Location')
              .setBodyText(message)
              .setImage(imageUrl, 'map')
              .addButton('View on google maps', mapsUrl)

            const richResponse = new RichResponse()
              .addSimpleResponse(message)
              .addBasicCard(card)

            app.tell(richResponse)
          })
          .catch(err => {
            console.error(err)
            app.tell('I wasn\'t able to find the space station. Try again later.')
          })

      } catch (err) {
        console.error(err)
        app.tell('I wasn\'t able to find the space station. Try again later.')
      }
      break
    default:
      app.tell('I\'m sorry, I don\'t know how to help with that.')
      break
  }
})

module.exports = router

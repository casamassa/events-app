require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 8000
const jwt = require("express-jwt")
const jwksRsa = require("jwks-rsa")
const jwtAuthz = require('express-jwt-authz')

const ManagementClient = require('auth0').ManagementClient;

app.use(bodyParser.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Set up Auth0 configuration 
const authConfig = {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  }

const managementAPI = new ManagementClient({
    domain: authConfig.domain,
    clientId: authConfig.clientId,
    clientSecret: authConfig.clientSecret
  })

// Create middleware to validate the JWT using express-jwt
const checkJwt = jwt({
    // Provide a signing key based on the key identifier in the header and the signing keys provided by your Auth0 JWKS endpoint.
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
    }),
  
    // Validate the audience (Identifier) and the issuer (Domain).
    audience: authConfig.audience,
    issuer: `https://${authConfig.domain}/`,
    algorithms: ["RS256"]
  })

const checkPermissions = jwtAuthz([ 'manage:users' ], { customScopeKey: 'permissions' })

// mock data to send to our frontend
let events = 
[
  {
    id: 1,
    name: 'Charity Ball',
    category: 'Fundraising',
    description: 'Spend an elegant night of dinner and dancing with us as we raise money for our new rescue farm.',
    featuredImage: 'https://placekitten.com/500/500',
    images: [
      'https://placekitten.com/500/500',
      'https://placekitten.com/500/500',
      'https://placekitten.com/500/500',
    ],
    location: '1234 Fancy Ave',
    date: '12-25-2021',
    time: '11:30'
  },
  {
    id: 2,
    name: 'Rescue Center Goods Drive',
    category: 'Adoptions',
    description: 'Come to our donation drive to help us replenish our stock of pet food, toys, bedding, etc. We will have live bands, games, food trucks, and much more.',
    featuredImage: 'https://placekitten.com/500/500',
    images: [
      'https://placekitten.com/500/500'
    ],
    location: '1234 Dog Alley',
    date: '11-21-2021',
    time: '12:00'
  }
]

app.get('/users', checkJwt, checkPermissions, (req, res) => {
    managementAPI
      .getUsers()
      .then(function(users) {
        console.log(req.user)
        res.send(users)
      })
      .catch(function(err) {
        console.log(err)
      })
  })

app.get('/users/:id/delete', checkJwt, checkPermissions, (req, res) => {
    managementAPI
    .deleteUser({ id: req.params.id })
    .then(response => {
      res.send('User deleted!')
    })
    .catch(function(err) {
      res.send(err)
    })
  })

app.get('/', (req, res) => {
  res.send(`Hi! Server is listening on port ${port}`)
})

app.get('/events', (req, res) => {
    res.send(events)
})

app.get('/events/:id', checkJwt, (req, res) => {
    const id = Number(req.params.id)
    const event = events.find(event => event.id === id)
    res.send(event)
})

// listen on the port
app.listen(port)
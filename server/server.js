//Express library
const express = require('express')
//Enable cross-origin resource sharing
const cors = require('cors')
//Password encryption
const bcryptjs = require('bcryptjs')
//Parse Cookies
const cookieParser = require('cookie-parser')
//Environment variable config
const dotenv = require('dotenv').config()
//Create express app
const app = express()
//Import database (PSQL)
const dbPool = require('./db')
//Cors options
const corsOptions = require('./corsOptions')

//Middleware cross-origin resource sharing (config)
app.use(cors(corsOptions))
//Middleware parsing application/json
app.use(express.json())
//Middleware parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
//Middleware parsing cookies
app.use(cookieParser())

//Controllers
const postRegister = require('./controllers/postRegister')

//Default end-point/route
app.get('/', (req,res) => {
  res.status(200).send('Server is live..')
})

//Register end-point/route
app.post('/register', (req, res) => postRegister(req, res, dbPool, bcryptjs))

//Login end-point/route
app.post('/login', async (req, res) => {
  //POST - destructed keys
  const {uEmail, uPassword} = req.body
  //Query definition
  const queryEmailValid = {
    text: 'SELECT email FROM users WHERE email = $1',
    values: [uEmail]
  }

  console.log('cookie', req.cookies['user'])

  try {
    //Query email to see if it exists with login email
    console.log('query email')
    const qev = await dbPool.query(queryEmailValid)
    //Validate email
    console.log('qev', qev.rows[0]?.email)
    if(uEmail !== qev.rows[0]?.email) {
      console.log('email NOT valid')
      return res.status(200).send({errMessage: "Email doesn't exist"})
    }
    //Query definition
    const queryEmailPassword = {
      text: 'SELECT password FROM users WHERE email = $1',
      values: [uEmail]
    }
    console.log('query hash pass')
    //Query email for hashed password
    const qep = await dbPool.query(queryEmailPassword)
    console.log('pass', qep.rows[0].password)
    //Password comapare with bcryptjs
    const passMatch = await bcryptjs.compare(uPassword, qep.rows[0].password)
    //Succesful login
    if(passMatch) {
      console.log('password match')
      //Query definition
      const queryUser = {
        text: 'SELECT * FROM users WHERE email = $1',
        values: [uEmail]
      }
      console.log('query user data')
      //Query user data to be sent back to client
      const qe = await dbPool.query(queryUser)
      //Destructure query data
      const {uid, name, email, gender, birthday} = qe.rows[0]
      //Format birthday
      const bDay = birthday ? `${birthday.getMonth()+1}-${birthday.getDate()}-${birthday.getFullYear()}` : birthday
      //Server response with user data & 5 min cookie
      return res.cookie('user', email, { maxAge: 300000, secure: true })
                .status(200)
                .send({id: uid, name: name, email: email, gender: gender, birthday: bDay})
    }
    //Unsuccessful login
    return res.status(200).send({errMessage: 'Password incorrect'})
  } catch(err) {
    console.error(err)
  }
})


//saveEdits end-point/route
app.post('/saveEdits', async (req, res) => {
  console.log('cookies', req.cookies.user)
  //Destructure object data
  const {id, edits} = req.body
  console.log('user edits', edits)

  try {
    //Array holds strings of key values from user submitted edits
    let qsEdits = []
    //Loop through creating key = value strings for database update query definition
    for(let [key, value] of Object.entries(edits)) {
      qsEdits.push(`${key} = '${value}'`)
    }

    //Create query definition from edits in the form: column=value
    const qs = `UPDATE users SET ${[...qsEdits]} WHERE uid = $1 RETURNING uid,name,email,gender,birthday`
    console.log(qs)
    //Query definition, change user properties based on what properties changed in database
    const queryUserUpdate = {
      text: qs,
      values: [id]
    }
    //Query update user data
    const quu = await dbPool.query(queryUserUpdate)
    //Destructure query data
    const {uid, name, email, gender, birthday} = quu.rows[0]
    //Format birthday
    const bDay = birthday ? `${birthday.getMonth()+1}-${birthday.getDate()}-${birthday.getFullYear()}` : birthday
    //Return user data after updating db
    return res.status(200).send({id: uid, name: name, email: email, gender: gender, birthday: bDay})
  } catch(err) {
    console.error(err)
  }
  //Error
  return res.status(500).send('Error updating user data to db')
})

//Set port production/local
const PORT = process.env.PORT || 3000

//Server active on specified port
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
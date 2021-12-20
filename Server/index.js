const express = require('express')
const app = express()
const cors = require('cors')
const bodyparser = require('body-parser')
const port = process.env.PORT || 3000
const path = require('path')
const exhandlebar = require('express-handlebars')
const db = require('../config/db')
const users = require('../model/userSchema')
const bycrypt = require('bcryptjs')
const photo = require('../model/photoSchema')
const multer = require('multer')
const session = require("express-session")

app.use(session({
    secret: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
    resave: false,
    saveUninitialized: true
}));

app.use(cors())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, '../views'))
app.use(express.static(path.join(__dirname, '../public')))
app.engine('hbs', exhandlebar({
    extname: 'hbs',
    defaultLayout: 'main'
}))
app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/health',(req,res)=>{
    res.send({message:'server is runnig fine'})
})

app.post('/login', (req, res) => {
    if (req.session.email) {
        res.redirect('/home')
    }
    else {
        users.findOne({ email: req.body.email }, (error, data) => {
            if (error) { res.send("somethings worng") }
            if (!data) {
                res.send("no email found, please register")
            }

            else {
                const hasspass = bycrypt.compareSync(req.body.password, data.password)
                if (hasspass) {
                    req.session.email = req.body.email;
                    res.redirect('/home')
                }
                else {
                    res.send("wrong password")
                }
            }
        })
    }
})

var passport = require('passport')

var userProfile
app.use(passport.initialize())

app.get('/google/success', (req, res) => {
    res.send(userProfile)
})

app.get('/error', (req, res) => res.send("error logging in"))

passport.serializeUser(function (user, cb) {
    cb(null, user);
})

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
})

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { reset } = require('nodemon')
const GOOGLE_CLIENT_ID = '433128550035-g74hkuurcetvsgukk2kofsfv2qvtd9ci.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'B_LmSwqoZ-xa2QwNZStYQi9C';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback"
},
    function (accessToken, refreshToken, profile, done) {

        userProfile = profile;
        return done(null, userProfile);
    }
));
app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    function (req, res) {
        // Successful authentication, redirect success.
        res.redirect('/home');
    });

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', (req, res) => {
    users.findOne({ email: req.body.email }, (err, data) => {
        if (data) {
            return res.send('email already exist')
        }
        else {
            hashpass = bycrypt.hashSync(req.body.password)
            users.create({
                name: req.body.name,
                email: req.body.email,
                password: hashpass,
                address: req.body.address,
                ph_no: req.body.ph_no

            }, (err, user) => {
                if (err) throw err
                res.send('registration succesful')
            })

        }
    })
})

app.get('/home', (req, res) => {
    photo.find({}, (err, user) => {
        if (err) throw err
        if (req.session.email) {
            res.render('home', {
                email: req.session.emai,
                list: user
            })
        } else {
            res.send("Unauthorize User")
        }

    }).lean()
})

app.get('/delete/:id', (req, res) => {
    photo.findByIdAndDelete(req.params.id, (err, txt) => {
        if (!err) {
            res.redirect('/home')
        }
    })
})

app.get('/update/:_id', (req, res) => {
    photo.findOne({ _id: req.params._id }, (err, user) => {
        if (!err) {
            res.render('update', {
                ulist: user
            })
        }
    }).lean()
})

app.post('/updateAll', (req, res) => {
    photo.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, data) => {
        if (!err) {
            res.redirect('/home')
        }
    })
})

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads/');
    },

    filename: function (req, file, callback) {
        let ext = path.extname(file.originalname)
        callback(null, Date.now() + ext);
    },
})

const upload = multer({
    storage: storage
})

app.post('/add', upload.single('image'), (req, res) => {
    photo.create({
        title: req.body.title,
        caption: req.body.caption,
        image: req.file.filename || null

    }, (err, user) => {
        if (err) throw err
        res.redirect('/home')
    })

})

app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.send("Error")
        } else {
            res.render('login', { title: "Express", logout: "logout Successfully...!" })
        }
    })
})

app.get('/forgot', (req, res) => {
    res.render('forgot')
})


app.listen(port, () => {
    console.log('server just started at 3000')
})
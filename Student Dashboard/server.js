const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// MongoDB connection

mongoose.connect('mongodb://127.0.0.1:27017/Class', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

const app = express();

let intialPath = __dirname;

app.use(bodyParser.json());
app.use(express.static(intialPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(intialPath, "index.html"));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(intialPath, "login.html"));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(intialPath, "register.html"));
});

// Define the User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
    },
    password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/register-user', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.json('fill all the fields');
    } else {
        const newUser = new User({
            name: name,
            email: email,
            password: password,
        });

        newUser.save()
            .then(user => {
                res.json(user);
            })
            .catch(err => {
                if (err.code === 11000) {  // MongoDB duplicate key error
                    res.json('email already exists');
                } else {
                    res.json('error registering user');
                }
            });
    }
});

app.post('/login-user', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email, password: password })
        .then(user => {
            if (user) {
                res.json(user);
            } else {
                res.json('email or password is incorrect');
            }
        })
        .catch(err => {
            res.json('error logging in');
        });
});

app.listen(3000, () => {
    console.log('listening on port 3000......');
});

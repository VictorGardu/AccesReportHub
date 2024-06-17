const express = require('express');

const path = require('path');

const { engine } = require('express-handlebars');

const myconnection = require('express-myconnection');

const mysql = require('mysql');

const session = require('express-session')

const bodyParser = require('body-parser')

const loginRoutes = require('./routes/login');



const app = express();
app.set('port', 4000);

app.use(express.static(path.join(__dirname, 'public')));


app.set('views', __dirname + '/views');
app.engine('.hbs', engine({
    extname: '.hbs',
}));

app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(myconnection(mysql, {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port: 3308,
    database: 'arh'
}));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));




app.listen(app.get('port'), () => {
    console.log('Escuchando en puerto: ', app.get('port'));
});

app.use('/', loginRoutes);



app.get('/', (req, res) => {
    if(req.session.loggedin == true){
        
        res.render('home', {name: req.session.name});

    }else{
        res.redirect('/login');
    }
});
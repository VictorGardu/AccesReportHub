const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const loginRoutes = require('./routes/login');
const cors = require('cors');
const fs = require('fs');


const app = express();



app.use(fileUpload());



app.use(cors());



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
    if (req.session.loggedin == true) {

        res.render('home', { name: req.session.name });

    } else {
        res.redirect('/login');
    }
});



app.post('/subidas', (req, res) => {
    console.log(req.files.file);
    let uploadedFile = req.files.file;

    // Mover el archivo a una ubicación específica
    uploadedFile.mv('./src/subidas/' + uploadedFile.name, function (err) {
        if (err) {
            console.error(err); // Loguear el error para depuración
            return res.status(500).send(err);
        }
        // Leer el contenido del archivo de texto
        const filePath = './src/subidas/' + uploadedFile.name;
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err); // Loguear el error para depuración
                return res.status(500).send(err);
            }

            // Enviar el contenido del archivo de texto como respuesta
            res.send(`Archivo ${uploadedFile.name} subido con éxito.
                Contenido: ${data}`);
        });
    });
});

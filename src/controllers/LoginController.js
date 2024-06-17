const bcrypt = require('bcrypt');
const { redirect } = require('express/lib/response');

function login(req, res){
    if(req.session.loggedin != true){

        res.render('login/index');

    }else{
        res.redirect('/');
    }
  
}

function auth(req, res) {
    const data = req.body;
    console.log('Datos recibidos:', data); // Depuración

    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión:', err);
            return res.status(500).send('Error de conexión');
        }

        conn.query('SELECT * FROM accounts WHERE email = ?', [data.email], (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).send('Error en la consulta');
            }

            console.log('Resultados de la consulta:', results); // Depuración

            if (results.length > 0) {
                const user = results[0]; // Suponiendo que el correo es único
                console.log('Usuario encontrado:', user); // Depuración

                bcrypt.compare(data.password, user.password, (err, isMatch) => {
                    if (err) {
                        console.error('Error en la comparación de contraseñas:', err);
                        return res.status(500).send('Error en la comparación de contraseñas');
                    }

                    console.log('Resultado de la comparación:', isMatch); // Depuración

                    if (isMatch) {
                        console.log('Bienvenido');
                        req.session.loggedin = true;
                        req.session.name = user.name;

                        res.redirect('/');
                    } else {
                        res.render('login/index', { error: 'Contraseña incorrecta' });
                    }
                });
            } else {
                res.render('login/index', {error: 'el usuario no existe'} );
            }
        });
    });
}

module.exports = auth;




function register(req, res){
    if(req.session.loggedin != true){

        res.render('login/register');

    }else{
        res.redirect('/');
    }
}



function storeUser(req, res){ 
    const data = req.body;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM accounts WHERE email = ?', [data.email], (err, userdata) => {
            if(userdata.length>0){
                res.render('login/register', {error: 'El usuario ya esta registrado.'});
            }else{
                
    if (!data.name || !data.password || !data.email) {
        res.render('login/register', {error: 'No cumple con los requisitos para registrarse.'});
    }
     

     const allowedDomain = 'accesgroup.com.mx'; 
     const emailDomain = data.email.split('@')[1];
     
     if (emailDomain !== allowedDomain) {
        res.render('login/register', {error: 'El correo electronico no es del dominio adecuado.'} );
    }



    bcrypt.hash(data.password, 12).then(hash => {
        data.password = hash;
     // console.log(data);
        req.getConnection((err, conn) => {
            if (err) {
                console.error('Error al obtener la conexión a la base de datos:', err);
                return res.status(500).send('Error interno del servidor');
            }
            const query = 'INSERT INTO accounts SET ?';



            conn.query(query, [data], (err, rows) => {
                if (err) {
                    console.error('Error en la consulta de inserción:', err);
                    return res.status(500).send('Error interno del servidor');
                }

                req.session.loggedin = true;
                req.session.name = data.name;

                res.redirect('/');
            });
        });
    });
            }
        });
    });

}


function logout(req, res){
    if(req.session.loggedin == true){
        req.session.destroy();
    }
        res.redirect('/login');
}



module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout,
}


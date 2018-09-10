var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();

var Usuario = require('../models/usuario');

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;

const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

//Autenticacion de Google
app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token).catch(e => {
        return false;
    });
    if (googleUser) {
        Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la busqueda.',
                    errors: err
                });
            }

            if (usuarioBD) {
                if (usuarioBD.google === false) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticacion normal...',
                        errors: null
                    });
                } else {
                    //Crear token
                    var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14000 });
                    res.status(200).json({
                        ok: 'Ok',
                        usuario: usuarioBD,
                        message: 'Autenticado.',
                        token: token,
                        id: usuarioBD._id
                    });

                }
            } else {
                //El usuario no existes hay que crearlo...
                var usuario = new Usuario();

                usuario.nombre = googleUser.nombre;
                usuario.email = googleUser.email;
                usuario.img = googleUser.img;
                usuario.google = true;
                usuario.password = ":)";
                usuario.save((err, usuarioBD) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al crear usuario.',
                            errors: err
                        });
                    } else {
                        usuarioBD.password = ':)';
                        //Crear token
                        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14000 });
                        return res.status(200).json({
                            ok: 'Ok',
                            usuario: usuarioBD,
                            message: 'Autenticado.',
                            token: token,
                            id: usuarioBD._id
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).json({
            ok: false,
            message: 'Token No valido.'
        });
    };
});

//Autenticacion Normal
app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en la busqueda.',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas.',
                errors: err
            });
        }

        if (!bcryptjs.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas.',
                errors: err
            });
        }
        usuarioBD.password = ':)';
        //Crear token
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14000 });
        res.status(200).json({
            ok: 'Ok',
            usuario: usuarioBD,
            message: 'Autenticado.',
            token: token,
            id: usuarioBD._id
        });

    });

});


module.exports = app;
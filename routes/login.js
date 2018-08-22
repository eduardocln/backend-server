var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();

var Usuario = require('../models/usuario');

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
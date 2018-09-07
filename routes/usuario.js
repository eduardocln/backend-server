var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var midAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');

//Obtener todos los usuarios.
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios.',
                    errors: err
                });
            }
            Usuario.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: conteo
                });
            });
        });
});

//Actualizar usuario.
app.put('/:id', midAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario.',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
                errors: null
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = usuario.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario.',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });

});

//Crear un nuevo usuario. req.usuario
app.post('/', midAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});
//Borrar un usuario por el id
app.delete('/:id', midAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario.',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe.',
                errors: null
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});
module.exports = app;
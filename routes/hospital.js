var express = require('express');
var midAutenticacion = require('../middlewares/autenticacion');
var app = express();
var Hospital = require('../models/hospital');

//Obtener el listado de hospitales...
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: true,
                    message: "Ocurrio un error al obtener hospitales.",
                    errors: err.message
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: false,
                    message: 'Ok Hospital',
                    hospital: hospital,
                    total: conteo
                });
            });


        });
});
//Actualizar hospital
app.put('/:id', midAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                message: "Error al obtener Hospital",
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: null
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar hospital.",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});
//Crear nuevo hospital
app.post('/', midAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: true,
                message: "Ocurrio un error al guardar hospital",
                errors: err
            });
        }
        res.status(201).json({
            ok: false,
            hospital: hospitalGuardado,
            errors: null
        });
    });
});
//Eliminar un hospital...
app.delete('/:id', midAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al borrar Hospital",
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: null
            });
        }
        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });
});
module.exports = app;
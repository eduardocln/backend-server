var express = require('express');
var midAutentication = require('../middlewares/autenticacion');
var app = express();
var Medico = require('../models/medico');

//Obtener todos los medicos...
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: "Error cargando usuarios.",
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medico: medicos,
                    total: conteo
                });
            });
        });
});
//Actualizar medico
app.put('/:id', midAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al obtener medico.",
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: "El medico con el id " + id + " no existe.",
                errors: null
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital._id;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: "Error al actualizar medico.",
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});
//Agregar medico...
app.post('/', midAutentication.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al guardar Medico.",
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            errors: null
        });
    });
});
//Eliminar medico
app.delete('/:id', midAutentication.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al eliminar medico",
                errors: err
            });
        }
        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                message: "El medico con el id " + id + " No existe.",
                errors: null
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    });
});
module.exports = app;
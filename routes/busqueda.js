var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//Busqueda Especifica
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    if (tabla == 'hospital') {
        promesa = buscarHospitales(busqueda, regex);
    } else if (tabla == 'medico') {
        promesa = buscarMedicos(busqueda, regex);
    } else if (tabla == 'usuario') {
        promesa = buscarUsuario(busqueda, regex);
    } else {
        return res.status(400).json({
            ok: false,
            message: "Los tipos de busqueda solo son: Hospitales,medicos y usuarios."
        });
    }
    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

//Busqueda general
app.get('/todo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuario(busqueda, regex)
        ])
        .then(respuesta => {
            res.status(200).json({
                ok: true,
                hospitales: respuesta[0],
                medicos: respuesta[1],
                usuarios: respuesta[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales...", err);
                } else {
                    resolve(hospitales);
                }
            });

    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar medicos...", err);
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuario) => {
                if (err) {
                    reject("Error al buscar usuarios.", err);
                } else {
                    resolve(usuario);
                }
            });
    });
}
module.exports = app;
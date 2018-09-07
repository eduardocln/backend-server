var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;
    //Tipos de coleccion
    var tipoColeccion = ['usuarios', 'medicos', 'hospitales'];
    if (tipoColeccion.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: "Tipo de coleccion no válido.",
            errors: { message: "Colecciones haceptadas:" + tipoColeccion.join(',') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: "No seleccionó nada.",
            errors: { message: "Debe seeleccionar una imagen." }
        });
    }
    //Obtener nombre del archivo...
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    //Solo estas extensiones aceptamos
    var extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: "Extension no válida.",
            errors: { message: "Extenciones haceptadas:" + extensionesValidas.join(',') }
        });
    }
    //Nombre del archivo personzalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    //MOVER EL ARCHIVO A UNA DIRECCION PARTICULAR..
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: "Error al mover archivo.",
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: "Error al busca usuario."
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            //Validar si existe la imagen vieja para borrarlo
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
                //fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            });
        });
    }
    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: "¡Error al buscar medico."
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Médico no existe',
                    errors: { message: 'Médico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            //Validar si existe la imagen vieja para borrarlo
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
                //fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: "Error al buscar hospital."
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            //Validar si existe la imagen vieja para borrarlo
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
                //fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}
module.exports = app;
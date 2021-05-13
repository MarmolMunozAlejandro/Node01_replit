"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proyectos = void 0;
const mongoose_1 = require("mongoose");
// Definimos el Schema
const proyectoSchema = new mongoose_1.Schema({
    _id: Number,
    pseudonimo: String,
    descripcion: String,
    presupuestoMensual: Number,
    tiempo: {
        fechaInicio: Date,
        fechaMeta: Date,
        terminado: Boolean,
    },
    financiacion: Number
});
exports.Proyectos = mongoose_1.model('proyectos', proyectoSchema);

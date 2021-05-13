"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empleados = void 0;
const mongoose_1 = require("mongoose");
// Definimos el Schema
const empleadoSchema = new mongoose_1.Schema({
    _id: String,
    nombre: String,
    fechaEntrada: Date,
    jornadaSemanal: Number,
    departamento: String,
    proyecto: Number,
    faltas: Number
});
exports.Empleados = mongoose_1.model('empleados', empleadoSchema);

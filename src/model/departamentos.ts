import {Schema, model } from 'mongoose'

// Definimos el Schema
const departamentoSchema = new Schema({
    _id: String,
    ingresoMensual:Number,
    sueldoHora:Number,
    proyectos:Array,
    })

export const Departamentos = model('departamentos',departamentoSchema)
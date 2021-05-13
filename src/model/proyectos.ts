import {Schema, model } from 'mongoose'

// Definimos el Schema
const proyectoSchema = new Schema({
  _id:Number,
  pseudonimo: String,
  descripcion: String,
  presupuestoMensual: Number,
  tiempo: {
    fechaInicio: Date, 
    fechaMeta: Date,
    terminado: Boolean,
    },   
  financiacion: Number
})

export const Proyectos = model('proyectos',proyectoSchema)
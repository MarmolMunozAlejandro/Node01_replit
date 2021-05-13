import { Departamentos} from './model/departamentos'
import { Empleados} from './model/empleados'
import { Inversores} from './model/inversores'
import { Proyectos} from './model/proyectos'
import { DepFondo, EmpleadosDep, EmpleadoDep, InversoresAbono } from './model/interfaces'

import { db } from './database/database'
import {Request, Response} from 'express'
import express from 'express'
const app = express()
const port = 3000


const fun1 = async (req: Request, res: Response) => {
    await db.conectarBD()
    .then( 
        async (mensaje) => {
          let array: Array<DepFondo>
          const query: any = await Departamentos.aggregate([

    {$lookup:{
        from: "empleados",
        localField: "_id",
        foreignField: "departamento",
        as: "empleados"
        }
    },{
    $lookup:{
        from: "proyectos",
        localField:"proyectos",
        foreignField: "_id",
        as: "proyectos"
        }
    },{
    $lookup:{
        from: "inversores",
        localField:"proyectos.financiación",
        foreignField: "_id",
        as: "inversor"
        }
    },{
    $project:{
        departamento:"$pseudónimo",
        ingresoMensual: "$ingresoMensual",
        financiación: {$sum:"$inversor.abono"},
        salarioEmpleados: 
                {$multiply:[
                    {$multiply:
                        [{$multiply:
                            ["$sueldoHora",
                            {$arrayElemAt:["$empleados.jornadaSemanal",0]}]},   
                        4]},
                    {$size:"$empleados"}]
                },
        costeProyectos: {$sum:"$proyectos.presupuestoMensual"}
            },
    },{
    $project:{
        ingresoMensual:1,
        financiación:1,
        salarioEmpleados:1,
        costeProyectos:1,
        ganancias: {$sum:["$ingresoMensual","$financiación"]},
        pagos:  {$sum:["$salarioEmpleados","$costeProyectos"]},
        fondos: 
            {$round:[
                {$subtract:[
                    {$sum:["$ingresoMensual","$financiación"]},
                    {$sum:["$salarioEmpleados","$costeProyectos"]},
                ]},
                0]
            }
        }        
    },{
    $sort:{
        _id:1}
    }  
])
array = query
console.log(array)
let exceso: number = 0
let perdida: number = 0
let reparto: number = 0
let elem: DepFondo

for (elem of array){

  if ( elem.fondos > 0){
    elem.ingresoMensual -= elem.fondos
    exceso += elem.fondos
    elem.fondos = 0
  }   

  if ( elem.fondos < 0){
    elem.ingresoMensual -= elem.fondos
    perdida -= elem.fondos
    elem.fondos = 0
  }
  
}

console.log(exceso+" de exceso")
console.log(perdida+" de perdida")

reparto = exceso - perdida
reparto = reparto/7
reparto = Math.round(reparto)

console.log("Se procede al reparto equitativo: "+reparto+" para cada departamento")

for (elem of array){
  elem.ingresoMensual+= reparto
  elem.fondos+= reparto
  
}
res.json(array)
})
.catch(
      (mensaje) => {
        res.send(mensaje)
        console.log(mensaje)
    })
    db.desconectarBD()
  }



const fun2 = async (req: Request, res: Response) => {
    const dinero : number = parseInt(req.params.dinero)

    await db.conectarBD()
    .then( 
        async (mensaje) => {

      let array: Array<EmpleadosDep>
      const query: any = await Empleados.aggregate([        
    {$lookup:{
        from: "departamentos",
        localField: "departamento",
        foreignField: "_id",
        as: "departamentoC"
        }
    },
    {$set:
        {diasTrabajados:
        {$round:
            [{$divide:
                [{$subtract:[new Date(), "$fechaEntrada"]},
                86400000]},
            0]
        },
        sueldo: {$multiply:
            [{$multiply:
                [{$arrayElemAt:["$departamentoC.sueldoHora",0]},
                "$jornadaSemanal"]},
            4]}
    }},{    
    $group:
        {
        _id: "$departamento",
        trabajadores: {$push:{nombre:"$nombre", faltas: "$faltas", diasTrabajados:"$diasTrabajados", sueldo:"$sueldo"}},
        faltasTotales: {$sum:"$faltas"}
        }
    
    }
])
array = query

let element: EmpleadosDep
let elem: EmpleadoDep
let tiempo:number = 0
let trabajadorElegido: string = ""

let trabajadoresNombre:Array<string> = []
let trabajadoresSueldo:Array<number> = [] //Una matriz triple
let trabajadoresPremio:Array<number> = []
let conjuntoDinero:number = 0
let porcentaje:number = 0
let premio:number = 0

for (element of array){

  for (elem of element.trabajadores){ //Se comparan los trabajadores

    if(elem.faltas==0){
      
      if(elem.diasTrabajados>tiempo)
      {tiempo = elem.diasTrabajados
      trabajadorElegido = elem.nombre}
    
    }
  }

  for (elem of element.trabajadores){//Se localiza al mejor y recompensa

      if(elem.nombre == trabajadorElegido)
      { trabajadoresNombre.push(elem.nombre)
        trabajadoresSueldo.push(Math.round(elem.sueldo))
        conjuntoDinero+=Math.round(elem.sueldo)
  }
}
tiempo = 0
}

for (var i = 0; i < trabajadoresSueldo.length; i++) {
  
  porcentaje = trabajadoresSueldo[i]/conjuntoDinero*100
  premio = porcentaje/100*dinero
  trabajadoresPremio.push(Math.round(premio))  
}

interface respuesta {
  nombre:string,
  salario:number,
  premio:number

}

let resultado:Array<respuesta> = []

for (var i = 0; i < trabajadoresNombre.length; i++){
  resultado.push({
    nombre:trabajadoresNombre[i],
    salario:trabajadoresSueldo[i],
    premio:trabajadoresPremio[i]

  })
}

res.json(resultado)
})
.catch(
      (mensaje) => {
        res.send(mensaje)
        console.log(mensaje)
    })
    db.desconectarBD()
  }

  const fun3 = async (req: Request, res: Response) => {

  const abonantes: Array<string> = ["EOLIC","NASA","Howarts"]
  const recaudacion: number = parseInt(req.params.dinero)
  let recaudado = 0

  await db.conectarBD()
    .then( 
        async (mensaje) => {

      let array: Array<InversoresAbono> = []
      const query: any = await Inversores.aggregate([ 
        {$group:{
         _id:"$nombre",
          abono:{$sum:"$abono"}
        }   
      }])   
      array = query
      let inversor: InversoresAbono
      const porcentaje:number = 0.05
      let x=1
      let confirmacion = false

      console.log(array)
      console.log(abonantes)
      console.log(abonantes.length)

      do{
      console.log("Ronda de donaciones numero "+x)
      x++

      for (inversor of array){
      
      console.log(inversor._id+":")

          for (var i = 0; i < abonantes.length; i++){

            if(inversor._id == abonantes[i]){
              confirmacion=true
              console.log("abona "+inversor.abono*porcentaje)
              recaudado+=inversor.abono*porcentaje
              console.log("Recaudado : "+recaudado)
            }
          }
          if(confirmacion==false){
            console.log("no abona nada")
            }
          confirmacion=false
      }
    } while(recaudado < recaudacion)

  let respuesta = ("Se ha recaudado " + recaudado + "$")

    res.json(respuesta)
 })
 .catch(
      (mensaje) => {
        res.send(mensaje)
        console.log(mensaje)
    })
    db.desconectarBD()
  }


  const fun0 = async (req: Request, res: Response) => {
   await db.conectarBD()
   res.send("Bienvenido a la base de datos de Marmol Center")
   db.desconectarBD()
 }

app.get('/fondos', fun1)
app.get('/premio/:dinero',fun2)
app.get('/donaciones/:dinero',fun3)
app.get('/',fun0)


app.listen(process.env.PORT || port, () => {
  console.log(`Listening...`)
})

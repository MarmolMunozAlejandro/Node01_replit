"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const departamentos_1 = require("./model/departamentos");
const empleados_1 = require("./model/empleados");
const inversores_1 = require("./model/inversores");
const database_1 = require("./database/database");
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const port = 3000;
const fun1 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        let array;
        const query = yield departamentos_1.Departamentos.aggregate([
            { $lookup: {
                    from: "empleados",
                    localField: "_id",
                    foreignField: "departamento",
                    as: "empleados"
                }
            }, {
                $lookup: {
                    from: "proyectos",
                    localField: "proyectos",
                    foreignField: "_id",
                    as: "proyectos"
                }
            }, {
                $lookup: {
                    from: "inversores",
                    localField: "proyectos.financiación",
                    foreignField: "_id",
                    as: "inversor"
                }
            }, {
                $project: {
                    departamento: "$pseudónimo",
                    ingresoMensual: "$ingresoMensual",
                    financiación: { $sum: "$inversor.abono" },
                    salarioEmpleados: { $multiply: [
                            { $multiply: [{ $multiply: ["$sueldoHora",
                                            { $arrayElemAt: ["$empleados.jornadaSemanal", 0] }] },
                                    4] },
                            { $size: "$empleados" }
                        ]
                    },
                    costeProyectos: { $sum: "$proyectos.presupuestoMensual" }
                },
            }, {
                $project: {
                    ingresoMensual: 1,
                    financiación: 1,
                    salarioEmpleados: 1,
                    costeProyectos: 1,
                    ganancias: { $sum: ["$ingresoMensual", "$financiación"] },
                    pagos: { $sum: ["$salarioEmpleados", "$costeProyectos"] },
                    fondos: { $round: [
                            { $subtract: [
                                    { $sum: ["$ingresoMensual", "$financiación"] },
                                    { $sum: ["$salarioEmpleados", "$costeProyectos"] },
                                ] },
                            0
                        ]
                    }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }
        ]);
        array = query;
        console.log(array);
        let exceso = 0;
        let perdida = 0;
        let reparto = 0;
        let elem;
        for (elem of array) {
            if (elem.fondos > 0) {
                elem.ingresoMensual -= elem.fondos;
                exceso += elem.fondos;
                elem.fondos = 0;
            }
            if (elem.fondos < 0) {
                elem.ingresoMensual -= elem.fondos;
                perdida -= elem.fondos;
                elem.fondos = 0;
            }
        }
        console.log(exceso + " de exceso");
        console.log(perdida + " de perdida");
        reparto = exceso - perdida;
        reparto = reparto / 7;
        reparto = Math.round(reparto);
        console.log("Se procede al reparto equitativo: " + reparto + " para cada departamento");
        for (elem of array) {
            elem.ingresoMensual += reparto;
            elem.fondos += reparto;
        }
        res.json(array);
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const fun2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dinero = parseInt(req.params.dinero);
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        let array;
        const query = yield empleados_1.Empleados.aggregate([
            { $lookup: {
                    from: "departamentos",
                    localField: "departamento",
                    foreignField: "_id",
                    as: "departamentoC"
                }
            },
            { $set: { diasTrabajados: { $round: [{ $divide: [{ $subtract: [new Date(), "$fechaEntrada"] },
                                    86400000] },
                            0]
                    },
                    sueldo: { $multiply: [{ $multiply: [{ $arrayElemAt: ["$departamentoC.sueldoHora", 0] },
                                    "$jornadaSemanal"] },
                            4] }
                } }, {
                $group: {
                    _id: "$departamento",
                    trabajadores: { $push: { nombre: "$nombre", faltas: "$faltas", diasTrabajados: "$diasTrabajados", sueldo: "$sueldo" } },
                    faltasTotales: { $sum: "$faltas" }
                }
            }
        ]);
        array = query;
        let element;
        let elem;
        let tiempo = 0;
        let trabajadorElegido = "";
        let trabajadoresNombre = [];
        let trabajadoresSueldo = []; //Una matriz triple
        let trabajadoresPremio = [];
        let conjuntoDinero = 0;
        let porcentaje = 0;
        let premio = 0;
        for (element of array) {
            for (elem of element.trabajadores) { //Se comparan los trabajadores
                if (elem.faltas == 0) {
                    if (elem.diasTrabajados > tiempo) {
                        tiempo = elem.diasTrabajados;
                        trabajadorElegido = elem.nombre;
                    }
                }
            }
            for (elem of element.trabajadores) { //Se localiza al mejor y recompensa
                if (elem.nombre == trabajadorElegido) {
                    trabajadoresNombre.push(elem.nombre);
                    trabajadoresSueldo.push(Math.round(elem.sueldo));
                    conjuntoDinero += Math.round(elem.sueldo);
                }
            }
            tiempo = 0;
        }
        for (var i = 0; i < trabajadoresSueldo.length; i++) {
            porcentaje = trabajadoresSueldo[i] / conjuntoDinero * 100;
            premio = porcentaje / 100 * dinero;
            trabajadoresPremio.push(Math.round(premio));
        }
        let resultado = [];
        for (var i = 0; i < trabajadoresNombre.length; i++) {
            resultado.push({
                nombre: trabajadoresNombre[i],
                salario: trabajadoresSueldo[i],
                premio: trabajadoresPremio[i]
            });
        }
        res.json(resultado);
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const fun3 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const abonantes = ["EOLIC", "NASA", "Howarts"];
    const recaudacion = parseInt(req.params.dinero);
    let recaudado = 0;
    yield database_1.db.conectarBD()
        .then((mensaje) => __awaiter(void 0, void 0, void 0, function* () {
        let array = [];
        const query = yield inversores_1.Inversores.aggregate([
            { $group: {
                    _id: "$nombre",
                    abono: { $sum: "$abono" }
                }
            }
        ]);
        array = query;
        let inversor;
        const porcentaje = 0.05;
        let x = 1;
        let confirmacion = false;
        console.log(array);
        console.log(abonantes);
        console.log(abonantes.length);
        do {
            console.log("Ronda de donaciones numero " + x);
            x++;
            for (inversor of array) {
                console.log(inversor._id + ":");
                for (var i = 0; i < abonantes.length; i++) {
                    if (inversor._id == abonantes[i]) {
                        confirmacion = true;
                        console.log("abona " + inversor.abono * porcentaje);
                        recaudado += inversor.abono * porcentaje;
                        console.log("Recaudado : " + recaudado);
                    }
                }
                if (confirmacion == false) {
                    console.log("no abona nada");
                }
                confirmacion = false;
            }
        } while (recaudado < recaudacion);
        let respuesta = ("Se ha recaudado " + recaudado + "$");
        res.json(respuesta);
    }))
        .catch((mensaje) => {
        res.send(mensaje);
        console.log(mensaje);
    });
    database_1.db.desconectarBD();
});
const fun0 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.conectarBD();
    res.send("Bienvenido a la base de datos de Marmol Center");
    database_1.db.desconectarBD();
});
app.get('/fondos', fun1);
app.get('/premio/:dinero', fun2);
app.get('/donaciones/:dinero', fun3);
app.get('/', fun0);
app.listen(process.env.PORT || port, () => {
    console.log(`Listening...`);
});

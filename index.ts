// Limpia la consola
import clear from "console-clear";
clear();

import express, { Request, Response } from "express";

import chalk from "chalk";
import cors from "cors";
import path from "path";
// variables de entorno
const PORT = process.env.PORT || 4000;
const CORS_URL = process.env.CORS_URL || "*";

// Crear una instancia de express
const app = express();

// Usa cors como middleware
app.use(cors({ origin: CORS_URL }));

// Configurar el directorio public
app.use(express.static(path.join(__dirname, "src/public")));

// Configurar EJS como motor de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
import { inicioRouter } from "@router";
app.use("/", inicioRouter);

import { db } from "./src/controllers";

app.use("/registro", db);

// Middleware de manejo de errores
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send("¡Algo salió mal!");
});

app.listen(PORT, () => {
  console.log(
    chalk.green.bold(`El servidor esta corriendo http://localhost:${PORT}`)
  );
});

export default app;

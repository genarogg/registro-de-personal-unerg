import express from "express";
import path from "path";
const router = express.Router();

import sqlite3 from "sqlite3";
// Configuración de la base de datos
const dbPath = path.join(__dirname, "db.sqlite"); // La ruta a tu archivo de base de datos SQLite

// Crear la conexión a la base de datos
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Error connecting to database: ", error);
    return;
  }
  console.log("Connected to the SQLite database");

  // Crear la tabla si no existe
  db.run(
    `CREATE TABLE IF NOT EXISTS personal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    cedula TEXT NOT NULL UNIQUE,
    direccion TEXT NOT NULL,
    estado TEXT,
    area TEXT NOT NULL,
    nucleo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    tendencia TEXT NOT NULL
);
  )`,
    (error) => {
      if (error) {
        console.error("Error creating table: ", error);
      } else {
        console.log("Table is ready or already exists.");
      }
    }
  );
});

// Get all personal data
router.get("/", (req, res) => {
  db.all(`SELECT * FROM personal`, [], (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});

// Get personal data by ID
router.get("/:id", (req, res) => {
  const dataId = req.params.id;
  db.get(`SELECT * FROM personal WHERE id = ?`, [dataId], (err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (!result) {
      res.status(404).send("Personal data not found");
    } else {
      res.json(result);
    }
  });
});

// Insert new personal data
router.post("/", (req, res) => {
  const newData = req.body;
  console.log(newData);
  const placeholders = Object.keys(newData)
    .map(() => "?")
    .join(",");
  const values = Object.values(newData);
  db.run(
    `INSERT INTO personal (${Object.keys(newData).join(
      ","
    )}) VALUES (${placeholders})`,
    values,
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(201).send("Personal data added successfully");
      }
    }
  );
});

// Update personal data
router.put("/:id", (req, res) => {
  const dataId = req.params.id;
  const updatedData = req.body;
  const updates = Object.keys(updatedData)
    .map((key) => `${key} = ?`)
    .join(",");
  const values = [...Object.values(updatedData), dataId];
  db.run(`UPDATE personal SET ${updates} WHERE id = ?`, values, function (err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send("Personal data updated successfully");
    }
  });
});

// Delete personal data
router.delete("/:id", (req, res) => {
  const dataId = req.params.id;
  console.log(dataId);
  db.run(`DELETE FROM personal WHERE id = ?`, [dataId], function (err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send("Personal data deleted successfully");
    }
  });
});

export default router;

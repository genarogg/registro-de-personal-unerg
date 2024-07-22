document.getElementById("login-btn").addEventListener("click", function () {
  document.getElementById("inicio").style.display = "none";
  document.getElementById("login-container").style.display = "block";
});

let registros = [];
document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const password = document.getElementById("admin-password").value;
    if (password === "admin123") {
      let response = await fetch("http://localhost:4000/registro");
      registros = await response.json();
      displayRegistros(registros);
      console.log(registros);
      document.getElementById("login-container").style.display = "none";
      document.getElementById("registration-container").style.display = "block";
    } else {
      alert("Contraseña incorrecta. Inténtelo de nuevo.");
    }
  });

let isEditing = false;
let editingIndex = -1;

document
  .getElementById("registration-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const cedula = document.getElementById("cedula").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;
    const nucleo = document.getElementById("nucleo").value;
    const estado =
      nucleo === "aulaMovil" ? document.getElementById("estado").value : "";
    const area = document.getElementById("area").value;
    const tendencia = document.getElementById("tendencia").value;

    if (cedula.length < 7 || cedula.length > 8) {
      alert("La cédula debe tener entre 7 y 8 dígitos.");
      return;
    }

    if (
      registros.some(
        (registro, index) =>
          registro.cedula === cedula && index !== editingIndex
      )
    ) {
      alert("Ya existe un registro con esta cédula.");
      return;
    }

    const registro = {
      nombre,
      apellidos,
      cedula,
      telefono,
      direccion,
      nucleo,
      estado,
      area,
      tendencia,
    };

    if (isEditing) {
      let response = await fetch(
        "http://localhost:4000/registro/" + registros[editingIndex].id,
        {
          method: "put",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registro),
        }
      );
      registros[editingIndex] = registro;
      isEditing = false;
      editingIndex = -1;
      document.getElementById("submit-button").textContent = "Registrar";
    } else {
      registros.push(registro);
      let response = await fetch("http://localhost:4000/registro/", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registro),
      });
    }

    displayRegistros(registros);

    document.getElementById("registration-form").reset();
    document.getElementById("estado-container").style.display = "none";
  });

document.getElementById("search-bar").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const filteredRegistros = registros.filter(
    (registro) =>
      registro.nombre.toLowerCase().includes(searchTerm) ||
      registro.apellidos.toLowerCase().includes(searchTerm) ||
      registro.cedula.toLowerCase().includes(searchTerm) ||
      registro.nucleo.toLowerCase().includes(searchTerm) ||
      registro.area.toLowerCase().includes(searchTerm) ||
      registro.tendencia.toLowerCase().includes(searchTerm)
  );
  displayRegistros(filteredRegistros);
});

function displayRegistros(registros) {
  const tbody = document.querySelector("#registro-tabla tbody");
  tbody.innerHTML = "";
  registros.forEach((registro, index) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td>${registro.nombre}</td>
            <td>${registro.apellidos}</td>
            <td>${registro.cedula}</td>
            <td>${registro.telefono}</td>
            <td>${registro.direccion}</td>
            <td>${registro.nucleo}${
      registro.estado ? ` (${registro.estado})` : ""
    }</td>
            <td>${registro.area}</td>
            <td>${registro.tendencia}</td>
            <td>
                <button class="edit-btn" data-index="${index}">Editar</button>
                <button class="delete-btn" data-index="${index}">Eliminar</button>
            </td>
        `;
    tbody.appendChild(newRow);

    newRow
      .querySelector(".delete-btn")
      .addEventListener("click", async function () {
        registros.splice(index, 1);
        let response = await fetch(
          "http://localhost:4000/registro/" + registro.id,
          {
            method: "delete",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        displayRegistros(registros);
      });

    newRow.querySelector(".edit-btn").addEventListener("click", function () {
      isEditing = true;
      editingIndex = index;
      document.getElementById("nombre").value = registro.nombre;
      document.getElementById("apellidos").value = registro.apellidos;
      document.getElementById("cedula").value = registro.cedula;
      document.getElementById("telefono").value = registro.telefono;
      document.getElementById("direccion").value = registro.direccion;
      document.getElementById("nucleo").value = registro.nucleo;
      if (registro.nucleo === "aulaMovil") {
        document.getElementById("estado-container").style.display = "block";
        document.getElementById("estado").value = registro.estado;
      } else {
        document.getElementById("estado-container").style.display = "none";
      }
      document.getElementById("area").value = registro.area;
      document.getElementById("tendencia").value = registro.tendencia;
      document.getElementById("submit-button").textContent = "Guardar Cambios";
    });
  });
}

document.getElementById("generate-pdf").addEventListener("click", function () {
  console.log("hola");
  generatePDF(registros);
});

document
  .getElementById("generate-pdf-search")
  .addEventListener("click", function () {
    const searchTerm = document
      .getElementById("search-bar")
      .value.toLowerCase();
    const filteredRegistros = registros.filter(
      (registro) =>
        registro.nombre.toLowerCase().includes(searchTerm) ||
        registro.apellidos.toLowerCase().includes(searchTerm) ||
        registro.cedula.toLowerCase().includes(searchTerm) ||
        registro.nucleo.toLowerCase().includes(searchTerm) ||
        registro.area.toLowerCase().includes(searchTerm) ||
        registro.tendencia.toLowerCase().includes(searchTerm)
    );
    generatePDF(filteredRegistros);
  });

function generatePDF(data) {
  console.log("generating pdf");
  console.log("data");
  console.log(data);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logo1 = new Image();
  logo1.src = "/ceinmujerlogo.jpg"; // Cambia esto a la ruta de tu logo
  const logo2 = new Image();
  logo2.src = "/logo-unerg.png"; // Cambia esto a la ruta de tu logo

  // Cargar los logos
  logo1.onload = () => {
    logo2.onload = () => {
      doc.addImage(logo1, "PNG", 10, 10, 50, 20);
      doc.addImage(logo2, "PNG", 150, 10, 50, 20);

      const tableColumn = [
        "Nombre",
        "Apellidos",
        "Cédula",
        "Teléfono",
        "Dirección",
        "Núcleo",
        "Área",
        "Tendencia",
      ];
      const tableRows = [];

      data.forEach((registro) => {
        const registroData = [
          registro.nombre,
          registro.apellidos,
          registro.cedula,
          registro.telefono,
          registro.direccion,
          registro.nucleo + (registro.estado ? ` (${registro.estado})` : ""),
          registro.area,
          registro.tendencia,
        ];
        tableRows.push(registroData);
      });

      doc.autoTable(tableColumn, tableRows, { startY: 40 });
      doc.save("registro_personal.pdf");
    };
  };
}

function selectNucleo() {
  const nucleo = document.getElementById("nucleo").value;
  const estadoContainer = document.getElementById("estado-container");
  estadoContainer.style.display = nucleo === "aulaMovil" ? "block" : "none";
}

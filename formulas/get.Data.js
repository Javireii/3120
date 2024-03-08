const axios = require("axios");
require("dotenv").config();
const web_Ser = process.env.web_service;

// Función para realizar la solicitud HTTP
module.exports = async function getData() {
  try {
    const response = await axios.get(web_Ser);

    // Verificar si la solicitud fue exitosa (código de estado 200)
    if (response.status === 200) {
      const info_vacantes = response.data.info_vacantes;
      return info_vacantes;
    } else {
      console.error(
        `Error en la solicitud. Código de estado: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const flowInfo = require("./flow.Info");
const flowFormulario = require("./flow.formulario");

module.exports = addKeyword(EVENTS.WELCOME, EVENTS.ACTION)
  .addAnswer("Bienvenido a _*Shades de México*_", {
    media: "https://drive.google.com/uc?id=1_E86UHQ8ueIaP1OAg3gHBrsNHC3ZpkKr",
  })
  .addAnswer(
    [
      "Conocé nuestras vacantes Activas y desarrolla tus habilidades con nosotros ",
      "",
      "*_Selecciona el numero de la opción deseada:_*\n",
      "1️⃣  Vacantes Activas",
      // "2️⃣  Aplicar a Vacante",
    ],
    null,
    null,
    [flowFormulario, flowInfo]
  );

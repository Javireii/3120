const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const flowBienvenida = require("./flow.Bienvenida");
//holasi
module.exports = addKeyword("salir").addAnswer(
  ["Gracias por tu interes", "Para volver a activar el flow escribe *_Hola_*"],
  null,
  async (_, { endFlow }) => {
    console.log("llegamos al finalizar?");
    return endFlow;
  }
);

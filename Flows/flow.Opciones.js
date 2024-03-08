const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const flowformulario = require("./flow.formulario");
const flowFinalizar = require("./flow.Finalizar");

module.exports = addKeyword(EVENTS.ACTION).addAnswer(
  "prueba de entrar",
  {
    capture: true,
  },
  async (ctx, { gotoFlow }) => {
    console.log(ctx);
    console.log(ctx.body);
    if (ctx.body == "salir") {
      return gotoFlow(flowFinalizar);
    } else if (ctx.body == "aplicar") {
      return gotoFlow(flowformulario);
    }
  }
  // [flowformulario, flowFinalizar]
);

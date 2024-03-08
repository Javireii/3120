require("@bot-whatsapp/provider/baileys");
const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const getData = require("../formulas/get.Data");
const flowFinalizar = require("./flow.Finalizar");
const flowformulario = require("./flow.formulario");

const flowOpciones = addKeyword(EVENTS.ACTION).addAnswer(
  [
    "Escribe la opción deseada",
    "*APLICAR* - Aplicar a esta vacante",
    "*SALIR* - Terminar el bot",
  ],
  null,
  null,
  [flowFinalizar, flowformulario]
);

// var data = getData();

module.exports = addKeyword(["1", "2", "3", "4", "5", "6", "7"]).addAction(
  async (ctx, { state, provider, fallBack, gotoFlow, flowDynamic }) => {
    const data = await getData();
    // console.log(data);
    const seleccion = state.getMyState();
    let vac = seleccion.vacante - 1;

    // console.log(vac);

    const id = ctx.key.remoteJid;

    const nombre_vacante = data[vac].nombre_vacante;
    await state.update({ vacante: nombre_vacante });

    const img = data[vac].url;
    const horario = data[vac].horario;
    const requisitos = data[vac].requisitos;
    const prestaciones = data[vac].prestaciones;
    const ubicacion = data[vac].ubicacion;

    if (vac >= 0 || vac || vac < 8) {
      //Nombre de Vacante
      await provider.sendText(id, `${nombre_vacante}\n`);
      await provider.sendMedia(id, img);

      //Requisitos
      await provider.sendText(id, `*_REQUISITOS:_*\n${requisitos}\n`);
      //Horario
      await provider.sendText(id, `*_NUESTROS HORARIOS SON:_*\n${horario}\n`);
      //Prestaciones
      await provider.sendText(id, `*_PRESTACIONES:_*\n${prestaciones}\n`);
      //Ubicaciones
      await provider.sendText(
        id,
        `*_UBICACIÓN:_*\n${ubicacion}\n 📍 Ubicación en _Maps_ ⬇️`
      );
      await provider.sendLocation(id, 20.639139408911632, -103.36872968796463);

      return gotoFlow(flowOpciones);
    } else {
      return fallBack();
    }
  }
);

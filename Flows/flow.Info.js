const { addKeyword } = require("@bot-whatsapp/bot");
const getData = require("../formulas/get.Data");
const flowVacantes = require("./flow.Vacantes");

let vacante_activa = [];
num_vacantes = null;

// module.exports = addKeyword("1")
// const flowInfo
module.exports = addKeyword(["1", "vacantes"])
  .addAnswer("_*VACANTES ACTIVAS:*_")
  .addAction(async (_, { flowDynamic }) => {
    try {
      const data = await getData();
      for (const key in data) {
        if (data[key].status == true) {
          vacante_activa[key] = data[key].nombre_vacante;
          await flowDynamic(
            `*🔸 ${parseInt(key) + 1}  ||*  ${vacante_activa[key]}`
          );
          num_vacantes = parseInt(key) + 1;
          // num_vac = num_vacantes
        }
      }
      // console.log(
      //   `Datos encontrados con exito, estas son las vacantes activas\n ${vacante_activa}`
      // );
    } catch {
      console.log("No se encontraron datos para la vacante");
    }
  })

  .addAnswer(
    "Selecciona el numero de la vacante de tu interes:",
    { capture: true },
    async (ctx, { state, fallBack }) => {
      await state.update({ vacante: parseInt(ctx.body) });

      eleccion = parseInt(ctx.body);
      if (Number.isNaN(eleccion) || eleccion > num_vacantes) {
        return fallBack(
          `*Error, selección invalida*,\n Selecciona el _*NUMERO*_ de la vacante correcto:\n`
        );
      } else {
        console.log(`Acceso exitoso, elección de vacante`);
      }
    },
    [flowVacantes]
  );
// module.exports = flowInfo;

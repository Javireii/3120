const { addKeyword } = require("@bot-whatsapp/bot");
require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");
const doc = new GoogleSpreadsheet(process.env.SHEET_KEY);
const CREDENTIALS = JSON.parse(fs.readFileSync("./credenciales.json"));
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { writeFile } = require("node:fs/promises");
const { google } = require("googleapis");
const apikeys = require("../drive_credenciales.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];
let STATUS = {};

const flowformulario = addKeyword(["2", "aplicar"])
  .addAnswer([
    "Gracias por tu interes en nuestras vacantes,",
    "",
    "Para crear tu solicitud, ayudanos registrando tus datos personales",
    "Toma en cuenta los siguientes puntos:",
    "",
    "🔻Ingresa tus datos correctamente",
    "🔻Ingresa datos veridicos, de lo contrario no se tomara en cuenta tu solicitud\n",
    "*FORMULARIO APLICACIÓN DE VACANTE*",
  ])

  /**
   * !Ingreso de Nombres
   */

  .addAnswer(
    ["👷 Ingresa tus *NOMBRES*", " _sin apellidos_ "],
    { capture: true, delay: 1000 },
    async (ctx) => {
      telefono = ctx.from;
      console.log("Nombre ", ctx.body);
      nombre = STATUS[telefono] = { ...STATUS[telefono], nombre: ctx.body };
      telefono = STATUS[telefono] = { ...STATUS[telefono], telefono: ctx.from };
    }
  )

  /**
   * !Ingreso de Apellidos
   */
  .addAnswer("👷 Ingresa tus *APELLIDOS*", { capture: true }, async (ctx) => {
    telefono = ctx.from;
    console.log("Apellido ", ctx.body);
    apellido = STATUS[telefono] = { ...STATUS[telefono], apellido: ctx.body };
  })

  /**
   * !Ingreso de Correo
   */

  .addAnswer(
    "✉️ Ingresa tu *CORREO*",
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      telefono = ctx.from;

      if (ctx.body.includes("@")) {
        console.log("Correo ", ctx.body);
        email = STATUS[telefono] = { ...STATUS[telefono], email: ctx.body }; //Variable del STATUS
        //await flowDynamic()
      } else {
        return fallBack(
          "🚫 _*ENTRADA INVALIDA*_, Ingresa de nuevo un ✉️ *CORREO* valido"
        );
      }
    }
  )

  /**
   * !Ingreso de Edad
   */

  .addAnswer(
    "👷 Ingresa tu *EDAD*",
    { capture: true },
    async (ctx, { fallBack }) => {
      telefono = ctx.from;
      old = parseInt(ctx.body);

      if (!Number.isNaN(old) && old > 17 && old < 50) {
        edad = STATUS[telefono] = { ...STATUS[telefono], edad: ctx.body };
        console.log("Edad ", old); //Variable del STATUS
        //await flowDynamic()
      } else {
        return fallBack("🚫 _*ENTRADA INVALIDA*_, Ingresa una *EDAD* valida ");
      }
    }
  )

  /**
   *
   * ! Subir archivo de Solicitud
   *
   */
  .addAnswer(
    [
      "*ADJUNTA TU SOLICITUD 📄*",
      "Sube una fotografias en _muy buena calidad_ de tu _*SOLICITUD O CURRICULUM*_",
      "⚠️ El formato aceptado es *.jpg*",
      "⚠️ Puedes tomar una fotografía con tu camara",
      '⚠️ O puedes adjuntar una foto desde "FOTOS & VIDEOS"',
      '⚠️ Si este formato sale nuevamente es"',
    ],
    { capture: true },
    async (ctx, { fallBack }) => {
      //*ID BOT
      telefono = ctx.from;

      id_bot = STATUS[telefono] = {
        ...STATUS[telefono],
        id: telefono + "@whatsB",
      };
      if (!ctx.body.includes("_event_media__")) {
        return fallBack("Formato invalido, ingresa un archivo *JPG*");
      } else {
        /**
         *
         * ?DESCARGA DE IMAGENES DEL USUARIO EN EL CHAT
         *
         */
        try {
          const buffer = await downloadMediaMessage(ctx, "buffer");
          console.log("Descargo imagen de chat usuario");
          await writeFile(`./assets/${id_bot.id}.jpg`, buffer);
          return await flowDynamic([{ media: `./assets/${id_bot.id}.jpg` }]);
        } catch (err) {
          console.log(err);
        }

        /**
         *
         * ?FUNCION PARA SUBIR LOS ARCHIVOS A DRIVE
         *
         */
        async function authorize() {
          const jwtClient = new google.auth.JWT(
            apikeys.client_email,
            null,
            apikeys.private_key,
            SCOPE
          );
          await jwtClient.authorize();
          return jwtClient;
        }

        // A Function that will upload the desired file to google drive folder
        async function uploadFile(authClient) {
          console.log("Iniciamos subida de archivos");

          return new Promise((resolve, rejected) => {
            const drive = google.drive({ version: "v3", auth: authClient });
            var fileMetaData = {
              name: `${id_bot.id}.jpg`,
              parents: ["13oBeiJFNTJ3heGxB-_gWftOQSyBAR9_M"], // A folder ID to which file will get uploaded
            };
            console.log(fileMetaData);

            drive.files.create(
              {
                resource: fileMetaData,
                media: {
                  body: fs.createReadStream(`./assets/${id_bot.id}.jpg`),
                },
                fields: "id",
              },
              function (error, file) {
                if (error) {
                  return rejected(error);
                }
                resolve(file);
              }
            );
          });
        }
        authorize()
          .then(async (authClient) => {
            await uploadFile(authClient);

            // Delete the file in the "assets" directory after upload
            fs.unlink(`./assets/${id_bot.id}.jpg`, (err) => {
              if (err) {
                console.error("Error deleting file:", err);
              } else {
                console.log("File deleted successfully");
              }
            });
          })
          .catch((error) => {
            console.error("Error uploading to Google Drive:", error);
          });
      }
    }
  )

  /**
   *
   *
   *
   * !INGRESO DE VACANTE
   *
   *
   */
  .addAction(async (ctx, { state }) => {
    telefono = ctx.from;
    let vac = await state.get("vacante");

    vacante = STATUS[telefono] = { ...STATUS[telefono], vacante: vac };

    ingresarDatos();
  })

  //////////////////  Vakidación de Datos  ////////////////////////////////////
  .addAnswer(
    "✅ _*REGISTRO DE VACANTE EXITOSA*_ ✅",
    { delay: 1000 },
    async (ctx, { flowDynamic }) => {
      telefono = ctx.from;

      const consultados = await consultarDatos(telefono);
      console.log(consultados);
      const Nombre = consultados["nombre"]; // AQUI DECLARAMOS LAS VARIABLES CON LOS DATOS QUE NOS TRAEMOS DE LA FUNCION         VVVVVVVVV
      const Apellido = consultados["apellido"];
      const Email = consultados["email"];
      const Telefono = consultados["telefono"];
      const Edad = consultados["edad"];
      const Vacante = consultados["vacante"];

      console.log(Nombre);
      console.log(Apellido);
      console.log(Email);
      console.log(Vacante);

      await flowDynamic(
        `▫️ *Nombre*: ${Nombre}\n▫️ *Appellido*: ${Apellido}\n▫️ *Correo*: ${Email}\n▫️ *Telefono*: ${Telefono}\n▫️ *Edad*: ${Edad} \n▫️ *Vacante*: ${Vacante}`
      );
    }
  )

  .addAnswer(
    [
      "👏 *Gracias por registrar tu vacante*",
      "Revisaremos todos tus datos, en caso de que cumplas nuestros requisitos, nos pondremos en contacto contigo",
    ],
    { delay: 3000 },
    null
  )
  .addAnswer([
    "Todos tus datos seran manejados con total discresion y solo para fines de reclutamiento",
    "Visita nuestro \n_*AVISO DE PRIVACIDAD*_ https://www.shadesdemexico.com/aviso-de-privacidad-bot",
  ]);

///////////////////////// Termina el flujo Sheets ////////////////////////////////////////

//////////// FUNCION AGREGAR DATOS A HOJA SHEET /////////////
async function ingresarDatos() {
  let fecha = new Date();
  let date_n = fecha.toLocaleString();
  // date_n = new Date();
  time_stamp = STATUS[telefono] = { ...STATUS[telefono], time_stamp: date_n };

  let rows = [
    {
      nombre: STATUS[telefono].nombre,
      apellido: STATUS[telefono].apellido,
      email: STATUS[telefono].email,
      telefono: STATUS[telefono].telefono,
      edad: STATUS[telefono].edad,
      vacante: STATUS[telefono].vacante,
      id_bot: STATUS[telefono].id,
      time_stamp: STATUS[telefono].time_stamp,
      solicitud: STATUS[telefono].id,
    },
  ];

  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });
  await doc.loadInfo();
  let sheet = doc.sheetsByIndex[0];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    await sheet.addRow(row);
  }
}

// /**
//  *
//  * Funcion para cargar datos desde google sheet
//  *
//  */

async function consultarDatos(telefono) {
  await doc.useServiceAccountAuth({
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  });
  await doc.loadInfo();
  let sheet = doc.sheetsByTitle["Registro_Bot"];

  consultados = [];

  let rows = await sheet.getRows();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (row.telefono === telefono) {
      consultados["nombre"] = row.nombre;
      consultados["apellido"] = row.apellido;
      consultados["email"] = row.email;
      consultados["telefono"] = row.telefono;
      consultados["edad"] = row.edad;
      consultados["vacante"] = row.vacante;
      consultados["solicitud"] = row.id;
    }
  }

  return consultados;
}

module.exports = flowformulario;

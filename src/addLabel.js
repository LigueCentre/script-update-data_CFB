const fs = require("fs");
const csv = require("csvtojson");


//Update with you file
///////////////////////////////////////////////////////////////
const E2F_FFF_PATH = {
  path: `${__dirname}/../importcsvlabel/LABEL-E2F-FFF.csv`,
  name: "LABEL ECOLE FEMININE DE FOOTBALL",
};
const JEUNES_FFF_PATH = {
  path: `${__dirname}/../importcsvlabel/LABEL-JEUNES-FFF.csv`,
  name: "LABEL JEUNE CREDIT AGRICOLE",
};

const JEUNES_FUTSAL_PATH = {
  path: `${__dirname}/../importcsvlabel/LABEL-JEUNES-FUTSAL.csv`,
  name: "LABEL JEUNE FUTSAL",
};

let arrayCSV = [E2F_FFF_PATH, JEUNES_FFF_PATH, JEUNES_FUTSAL_PATH];
/////////////////////////////////////////////////////////////////////


let dataClub;
const addLabel = new Promise(async (resolve, reject) => {
  // On vérifie si les fichiers csv label existe
  if (!fs.existsSync(E2F_FFF_PATH.path)) {
    reject("LABEL-E2F-FFF.json Manquant");
  }
  if (!fs.existsSync(JEUNES_FFF_PATH.path)) {
    reject("LABEL-JEUNES-FFF.json Manquant");
  }
  if (!fs.existsSync(JEUNES_FUTSAL_PATH.path)) {
    reject("LABEL-JEUNES-FUTSAL.json Manquant");
  }

  // On vérifie si le fichier de data existe
  fs.readFile(`${__dirname}/../jsonexported/data.json`, (err, jsondata) => {
    if (err) {
      // Si il n'existe pas on reject
      if (err.code === "ENOENT") {
        reject("Fichier de data introuvable");
      } else {
        // Autre erreur sur la lecture du fichier => Reject
        reject(err);
      }
    } else {
      dataClub = JSON.parse(jsondata);
    }
  });

  let allLabel = {};
  // Function qui lis les CSV Label
  function processingCSV(label) {
    return new Promise((resolve,reject) => {
      csv()
        .fromFile(label.path)
        .then((jsonObj) => {
          resolve(jsonObj);
        })
        .catch(() => {
          reject("Fichier d'import introuvable");
        });
    });
  }

  // function qui boucle sur l'array de CSV et qui ajoute le contenue des csv dans l'objet allLabel
  async function processingLABEL() {
    for (const item of arrayCSV) {
      await processingCSV(item).then((jsonObj)=>{
      allLabel[item.name] = jsonObj
      });
    }
  }

  await processingLABEL();

  // Boucle sur l'objet allLabel
  for (const [key, value] of Object.entries(allLabel)) {
    // Boucle sur la liste des clubs
    dataClub.forEach((club,index)=>{
      // A chaque club on vérifie si son Num club est inclue dans la liste de label (de l'itération en cours)
      if(value.some(e=>e.NumClub === club.NumClub)){
        // on vérifie que le label n'est pas deja stocké dans le club
        if(!club["label"].includes(key)){
          // on ajoute le label
          club["label"].push(key)
        }
      }
      console.log("Chargement en cours...")
      console.log((index + 1 ) +" sur " + dataClub.length)
    })
  }
  resolve(dataClub)
});

addLabel
  .then((res) => {
    console.log("sauvegarde du fichier");
    fs.writeFileSync(
      `${__dirname}/../jsonexported/data.json`,
      JSON.stringify(res)
    );
    console.log("\x1b[32m", "Le script s'est terminé avec succès");
    console.log("\x1b[0m");
  })
  .catch((err) => {
    console.log("\x1b[33m", err);
    console.log("\x1b[31m", "Le script s'est terminé avec une erreur");
    console.log("\x1b[0m");
  });

const csvFilePath = `${__dirname}/../csvtoaddlatlong/clubsAdress.csv`;
const { rejects } = require("assert");
const csv = require("csvtojson");
const fs = require("fs");
const { resolve } = require("path");

const add = new Promise(async (resolve, reject) => {
  if (fs.existsSync(csvFilePath)) {
    let clubWithLatLong;

    await csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        clubWithLatLong = jsonObj;
      });

    clubWithLatLong.forEach((element) => {
      if (
        !element.hasOwnProperty("Latitude") ||
        !element.hasOwnProperty("Longitude")
      ) {
        reject("Latitude et Longitude manquante");
      }
      if (
        !element.hasOwnProperty("numClub") ||
        !element.hasOwnProperty("AdressePostale")
      ) {
        reject(
          "Erreur dans le format du csv (numClub ou AdressePostale manquant)"
        );
      }
    });

    fs.readFile(`${__dirname}/data/dataSave.json`, async function (err, data) {
      if (err) {
        console.log(err);
      }
      let newData = JSON.parse(data);

      await newData.forEach((element) => {
        let clubWithLatLongFiltered = clubWithLatLong.filter(
          (res) => res.numClub === element.NumClub.toString()
        );
        if (clubWithLatLongFiltered.length > 0) {
          element.Latitude = clubWithLatLongFiltered[0].Latitude;
          element.Longitude = clubWithLatLongFiltered[0].Longitude;
        } else {
          reject("Club inconnu");
        }
      });
      resolve(newData);
    });
  } else {
    reject("Fichier Introuvable");
  }
});

add
  .then(async (res) => {
    console.log("sauvegarde du fichier");
    fs.writeFileSync("./jsonexported/data.json", JSON.stringify(res));
    console.log("suppression du fichier de sauvegarde");

    new Promise((resolve, reject) => {
      fs.unlink("./src/data/dataSave.json", function (err) {
        if (err && err.code == "ENOENT") {
          reject("Le fichier n'existe pas dataSave.csv");
        } else if (err) {
          reject("Other error");
        } else {
          resolve("Fichier dataSave supprimé");
        }
      });
    })
      .then((res) => {
        console.log(res);
        new Promise((resolve, reject) => {
          // Suppression du fichier csv
          fs.unlink("./csvtoaddlatlong/clubsAdress.csv", function (err) {
            if (err && err.code == "ENOENT") {
              reject("Le fichier n'existe pas clubsAdress.csv");
            } else if (err) {
              reject("Other error");
            } else {
              resolve("Fichier dataSave supprimé");
            }
          });
        })
          .then((res) => {
            console.log(res);
            console.log("Le script s'est éxécuté avec succés");
            process.exit(1);
          })
          .catch((err) => {
            console.log(err);
            console.log("Script terminés avec une erreur");
            process.exit(1);
          });
      })
      .catch((err) => {
        console.log(err);
        console.log("Script terminés avec une erreur");
        process.exit(1);
      });
  })
  .catch((res) => {
    console.log(res);
    console.log("Script terminés avec une erreur");
    process.exit(1);
  });

const csvFilePath = `${__dirname}/../csvtoaddlatlong/clubsAdress.csv`;
const csv = require("csvtojson");
const fs = require("fs");

const add = new Promise(async (resolve, reject) => {
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
});

add
  .then((res) => {
    console.log("sauvegarde du fichier");
    fs.writeFileSync("data.json", JSON.stringify(res));
    console.log("suppression du fichier de sauvegarde");

    // Suppression du fichier d'import
    fs.unlink("./data/dataSave.csv", function (err) {
      if (err && err.code == "ENOENT") {
        console.info("Le fichier n'existe pas");
      } else if (err) {
        console.error("Other error");
      } else {
        console.info(`Fichier supprimé`);
      }
    });
    // Suppression du fichier csv
    fs.unlink("./data/clubsAdress.csv", function (err) {
      if (err && err.code == "ENOENT") {
        console.info("Le fichier n'existe pas");
      } else if (err) {
        console.error("Other error");
      } else {
        console.info(`Fichier supprimé`);
      }
    });
    console.log("Le script s'est éxécuté avec succés")
    process.exit(1);
  })
  .catch((res) => {
    console.log(res);
    console.log("Script terminés avec une erreur");
  });

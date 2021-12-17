const fs = require("fs");
const categories = require("./data/categories.json");
const csv = require("csvtojson");
const { Axios, default: axios } = require("axios");
const csvFilePath = `${__dirname}/../csvimport/import.csv`;

const createAllClub = new Promise(async (resolve, reject) => {
  console.log("Lancement du script");
  let clubs = [];
  let cats = [];

  let results;

  await csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      results = jsonObj;
    })
    .catch(() => {
      reject("Fichier d'import introuvable");
    });

  let clubsID = [];
  if (results.length > 0) {
    results.forEach((element) => {
      // Modification des catégorie
      results.forEach((element) => {
        if (element["Libellé catégorie"] === "Foot Loisir / Foot Loisir") {
          element["Libellé catégorie"] = "Football Loisir / Football Loisir";
        }
      });

      // on controle le nombre de catégorie stocké dans la liste des teams
      if (!cats.includes(element["Libellé catégorie"])) {
        cats.push(element["Libellé catégorie"]);
      }

      // On vérifie si le club n'a pas déja été créer
      if (!clubsID.includes(element["Numéro de club"])) {
        // On pousse le numéro du club dans un array
        clubsID.push(element["Numéro de club"]);
        // on filtre toutes les équipes du club
        let teams = results.filter(
          (team) => team["Numéro de club"] === element["Numéro de club"]
        );

        let teamsNewFormat = [];
        let cat = [];
        let gender = [];
        let minAge = 6;
        let maxAge = 6;

        teams.forEach((team) => {
          const indexCat = categories.findIndex(
            (cat) => cat.name === team["Libellé catégorie"]
          );

          if (indexCat === -1) {
            console.log("error: catégorie inconnu");
            console.log("error: " + team["Libellé catégorie"]);
          }
          const newTeam = {
            gender: categories[indexCat].gender,
            teamName: team["Nom équipe"],
            categorie: team["Libellé catégorie"],
          };

          // on vérifie que la catégorie n'a pas déja été traité
          if (!cat.includes(team["Libellé catégorie"])) {
            // on pousse la cat dans un array
            cat.push(team["Libellé catégorie"]);

            // On vérifie que le sexe n'est pas déja présent et on l'inclu si necessaire
            if (!gender.includes(categories[indexCat].gender)) {
              gender.push(categories[indexCat].gender);
            }
            // on ajuste l'age en fonction des catégorie
            minAge > categories[indexCat].minAge
              ? (minAge = categories[indexCat].minAge)
              : null;
            maxAge < categories[indexCat].maxAge
              ? (maxAge = categories[indexCat].maxAge)
              : null;
          }
          teamsNewFormat.push(newTeam);
        });

        let Lat;
        let Long;
        // on vérifie si une lattidue existe
        if (element.Latitude.length > 0 && element.Longitude.length > 0) {
          Lat = element.Latitude.replace(",", ".");
          Long = element.Longitude.replace(",", ".");
        } else {
          Lat = "";
          Long = "";
        }

        let clubsToPush = {
          codePostal: element["Code postal (club)"],
          NumClub: element["Numéro de club"],
          AdressePostale: element["AdressePostale"],
          Mail: element["MailClub"],
          Localite: element["Localité club"],
          equipes: teamsNewFormat,
          NomClub: element["Nom de club"],
          Latitude: Lat,
          Longitude: Long,
          categories: cat,
          gender: gender,
          minAgeInClub: minAge,
          maxAgeInClub: maxAge,
          label:[]
        };
        clubs.push(clubsToPush);
      }
    });

    let clubinError = 0;
    // on check si toutes les lat long sont la
    clubs.forEach((club) => {
      let error = false;
      if (club.Latitude.length === 0) {
        error = true;
        // console.log("Latitude manquante sur le club " + club.NomClub);
      }
      if (club.Longitude.length === 0) {
        error = true;
        // console.log("Longitude manquante sur le club " + club.NomClub);
      }
      if (error) {
        clubinError++;
      }
    });

    if (clubinError > 0) {
      console.log(
        "\x1b[33m",
        `WARN: ${clubinError} clubs n'ont pas de coordonnées LAT LONG`
      );
      console.log("\x1b[0m");
    }

    resolve({ clubs: clubs, cats: cats, clubInError: clubinError });
  }
});

createAllClub
  .then(async (value) => {
    let data = value.clubs;
    let clubWhenNotcoordinates = [];

    function task(args) {
      return new Promise((resolve) => {
        let adress = args.adress.replace("CEDEX", "");

        axios
          .get(
            `https://api-adresse.data.gouv.fr/search/?q=${adress}&postcode=${args.codepost}&limit=1`
          )
          .then((res) => {
            console.log();
            const index = data.findIndex(
              (item) => item.NumClub === args.numclub
            );
            if (res.data.features.length > 0) {
              console.log("Résultat trouvé");
              data[index].Longitude =
                res.data.features[0].geometry.coordinates[0];
              data[index].Latitude =
                res.data.features[0].geometry.coordinates[1];
              resolve();
            } else {
              clubWhenNotcoordinates.push(data[index]);
              console.log("Résultat non trouvé");
              resolve();
            }
          });
      });
    }

    async function processArray(array) {
     for (const item of array) {
        const object = {
           i: array.findIndex((res) => res.NumClub === item.NumClub),
          codepost: item.codePostal,
          numclub: item.NumClub,
          adress: item.AdressePostale,
        };
        await task(object);
        const num = object.i + 1;
        console.log(num + " sur " + array.length);
      }

      let result = JSON.stringify(data);
      if (clubWhenNotcoordinates.length > 0) {
        let newClubs = []

        // on stock tout les clubs et adress dans un fichier csv
        await new Promise((resolve, reject) => {
          value.clubs.forEach((club) => {
            const adress = club["AdressePostale"].replace(",", "");
            newClubs.push({
              numClub: club["NumClub"],
              AdressePostale: adress,
              Latitude: club.Latitude,
              Longitude: club.Longitude,
            });
          });
          if (value.clubs.length === newClubs.length) {
            resolve();
          }
        }).then(() => {
          // On convertie l'array en csv et on l'enregistre
          function arrayToCSV(data) {
            csvToError = data.map((row) => Object.values(row));
            csvToError.unshift(Object.keys(data[0]));
            fs.writeFileSync(
              "./csvtoaddlatlong/clubsAdress.csv",
              csvToError.join("\n")
            );
            console.log("Csv créee");
          }

          arrayToCSV(newClubs);

          // Suppression du fichier d'import
          fs.unlink("./csvimport/import.csv", function (err) {
            if (err && err.code == "ENOENT") {
              console.info("Le fichier n'existe pas");
            } else if (err) {
              console.error("Other error");
            } else {
              console.info(`Fichier supprimé`);
            }
          });

          console.log(
            "\x1b[33m",
            `WARN: ${clubWhenNotcoordinates.length} clubs n'ont pas de coordonnées`
          );
          console.log("\x1b[32m", "Script terminés avec succés!");
          console.log("\x1b[0m");

          fs.writeFileSync("./jsonexported/data.json", result);
        });
      } else {
        fs.writeFileSync("./jsonexported/data.json", result);
        console.log("\x1b[32m", "Script terminés avec succés!");
        console.log("\x1b[0m");
      }
    }
    await processArray(data);
    process.exit(1);
  })
  .catch((res) => {
    console.log(res);
    console.log("\x1b[33m", "Script terminés avec une erreur");
    console.log("\x1b[0m");
    process.exit(1);
  });

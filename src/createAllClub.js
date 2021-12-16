const fs = require("fs");
const categories = require("./data/categories.json");
const csv = require("csvtojson");
const csvFilePath = `${__dirname}/../csvimport/import.csv`;

const createAllClub = new Promise(
  async (resolve, reject) => {
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
            NumClub: element["Numéro de club"],
            AdressePostale: element["AdressePostale"],
            Mail: element["MailClub"],
            Localite: element["Bureau distributeur"],
            equipes: teamsNewFormat,
            NomClub: element["Nom de club"],
            Latitude: Lat,
            Longitude: Long,
            categories: cat,
            gender: gender,
            minAgeInClub: minAge,
            maxAgeInClub: maxAge,
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
      console.log(clubinError + " clubs n'ont pas de coordonnées LAT LONG");
      resolve({ clubs: clubs, cats: cats, clubInError: clubinError });
    }
  }
);


createAllClub
  .then(async (value) => {
    let data = JSON.stringify(value.clubs);

    // Si un club est en erreur
    if (value.clubInError > 0) {
      console.log("Création du csv");
      let newClubs = [];

      // on stock tout les clubs et adress dans un fichier csv
      await new Promise((resolve, reject) => {
        value.clubs.forEach((club) => {
          const adress = club["AdressePostale"].replace(",", "");
          newClubs.push({ numClub: club["NumClub"], AdressePostale: adress });
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
      });
      console.log("Sauvegarde du fichier de data");
      console.log("Warning: Veuillez ajouter les lattitudes et longitudes sur le fichier clubsAdress.csv (/csvtoaddlatlong/clubsAdress.csv) et éxecuter la commande npm run addlatlong")
      fs.writeFileSync("./src/data/dataSave.json", data);
    } else {
      fs.writeFileSync("./jsonexported/data.json", data);
    }
    console.log("Le script s'est éxécuté avec succés")
    process.exit(1);
  })
  .catch((res) => {
    console.log(res);
    console.log("Script terminés avec une erreur");
    process.exit(1);
  });
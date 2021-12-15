const fs = require("fs");
const { connection } = require("./db_connection");
const categories = require("./categories.json");

const createAllClub = new Promise((resolve, reject) => {
  console.log("début");
  let clubs = [];
  let cats = [];
  const sql = "SELECT * FROM `TABLE 2` ";
  connection.query(sql, (err, results) => {
    console.log(results[0]);
    if (err) {
      console.log(err);
      reject();
    } else {
      let clubsID = [];

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

        if (!clubsID.includes(element["Numéro de club"])) {
          clubsID.push(element["Numéro de club"]);

          let teams = results.filter(
            (team) => team["Numéro de club"] === element["Numéro de club"]
          );

          let teamsNewFormat = [];
          let cat = [];
          let minAge = 0;
          let maxAge = 0;

          teams.forEach((team) => {
            let newTeam = {
              teamName: team["Nom équipe"],
              categorie: team["Libellé catégorie"],
            };

            if (!cat.includes(team["Libellé catégorie"])) {
              cat.push(team["Libellé catégorie"]);

              let index = categories.findIndex(
                (categorie) => team["Libellé catégorie"] === categorie.name
              );
              if (index === -1) {
                console.log("error: " + team["Libellé catégorie"]);
              } else {
                minAge > categories[index].minAge
                  ? (minAge = categories[index].minAge)
                  : null;
                maxAge < categories[index].maxAge
                  ? (maxAge = categories[index].maxAge)
                  : null;
              }
            }

            teamsNewFormat.push(newTeam);
          });

          let clubsToPush = {
            NumClub: element["Numéro de club"],
            AdressePostale: element["AdressePostale"],
            Mail: element["MailClub"],
            Localite: element["Bureau distributeur"],
            equipes: teamsNewFormat,
            NomClub: element["Nom de club"],
            Latitude: element.Lat,
            Longitude: element.Long,
            categories: cat,
            minAgeInClub: minAge,
            maxAgeInClub: maxAge,
          };

          // !allCat.includes(element['Libellé catégorie']) ? allCat.push(element['Libellé catégorie']):null

          clubs.push(clubsToPush);
        }
      });

      resolve({ clubs: clubs, cats: cats });
    }
  });
});

createAllClub.then((value) => {
  console.log(value.clubs[0]);
  let data = JSON.stringify(value.clubs);
  fs.writeFileSync("data.json", data);
  // process.exit(1);
});

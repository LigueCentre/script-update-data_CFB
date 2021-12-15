// require('dotenv').config();
// const PORT = process.env.PORT;
// const app = require('./app');

// app.listen(PORT, (err) => {
//   if (err) {
//     console.error(`Error: ${err.message}`);
//   } else {
//     console.log(`Server is running on port: ${PORT}`);
//   }
// });

const fs = require("fs");
const { connection } = require("./db_connection");

const createAllClub = new Promise((resolve, reject) => {
  console.log("début");
  let clubs = [];
  const sql = "SELECT * FROM `TABLE 2` ";
  connection.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      reject();
    } else {
      let clubsID = [];
      results.forEach((element) => {
        if (!clubsID.includes(element["Numéro de club"])) {
          clubsID.push(element["Numéro de club"]);

          let teams = results.filter(
            (team) => team["Numéro de club"] === element["Numéro de club"]
          );

          let teamsNewFormat = [];
          let cat = [];

          teams.forEach((team) => {
            let newTeam = {
              teamName: team["Nom équipe"],
              categorie: team["Libellé catégorie"],
            };
            !cat.includes(team["Libellé catégorie"])
              ? cat.push(team["Libellé catégorie"])
              : null;
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
          };

          clubs.push(clubsToPush);
        }
      });

      resolve(clubs);
    }
  });
});

createAllClub.then((value) => {
  let data = JSON.stringify(value);
  fs.writeFileSync("data.json", data);

  process.exit(1);
});

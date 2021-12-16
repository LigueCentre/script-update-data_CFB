const csvFilePath = `${__dirname}/../datalatlong.csv`;
const csv = require("csvtojson");
const fs = require("fs");


const add = new Promise (async (resolve,reject)=>{
    let clubWithLatLong;

    await csv()
      .fromFile(csvFilePath)
      .then((jsonObj) => {
        clubWithLatLong = jsonObj;
      });
  
    fs.readFile(`${__dirname}/../data.json`,async function (err, data) {
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
          console.log("error");
        }
      });
     resolve(newData)
    });
  
})

add.then((res)=>{
    fs.writeFileSync("data.json", JSON.stringify(res));
    process.exit(1);
})

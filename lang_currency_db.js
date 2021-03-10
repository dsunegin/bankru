const language ='uk';
const jsonfile = require('jsonfile')
const file = './currency_db/data/currencies/'+language+'.json'
const mysql = require("mysql2");
const envconf = require('dotenv').config();

const connectionFinance = mysql.createConnection({
    host: process.env.DB_FINHOST,
    port: process.env.DB_FINPORT,
    user: process.env.DB_FINUSER,
    database: process.env.DB_FINDATABASE,
    password:  process.env.DB_FINPASSWORD
}).promise();


const main = async () => {

     const FxNames = await  jsonfile.readFile(file)
            .then(obj => obj.Names )
            .catch(error => console.error(error))

    let sql = `SELECT * FROM currency WHERE lang='${language}'`;
    let result = await connectionFinance.query(sql);

    if (result[0].length == 0) return "NO currency DB for "+language;
    const features = result[0];

    const featuresExt = await Promise.all(features.map(async currencyObj => {
        const code = currencyObj.code;
        if (!FxNames[code]) return;
        const currency=FxNames[code][1].toString().capitalize();
        const sql = `UPDATE currency SET currency='${currency}'  WHERE lang='${language}' AND code='${code}'`;
        await connectionFinance.query(sql).then(result => {

        });
        return result;
    }));


    return 'Proceed'
}

main()
.then(created =>  console.log(created))
.catch(err => console.error(err));

String.prototype.capitalize = function() { return this.charAt(0).toUpperCase() + this.slice(1);}
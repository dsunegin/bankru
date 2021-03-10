const mysql = require("mysql2");
const envconf = require('dotenv').config();
const axios = require('axios');
const parseString = require('xml2js').parseString;
let iconv = require('iconv-lite');

if (envconf.error) {   throw envconf.error};        // ERROR if Config .env file is missing

const connectionFinance = mysql.createConnection({
    host: process.env.DB_FINHOST,
    port: process.env.DB_FINPORT,
    user: process.env.DB_FINUSER,
    database: process.env.DB_FINDATABASE,
    password:  process.env.DB_FINPASSWORD
}).promise();


let start = (process.env.PERIOD=='today' || process.env.PERIOD=='tomorrow' ) ? new Date() : new Date(2020,0,1);
let end = new Date();       // Now

(async () => {
    while (start <= end) {
        let fxyear= start.getFullYear();
        let fxmonth = (start.getMonth()+1).toString().padStart(2, "0");
        let fxdate =start.getDate().toString().padStart(2, "0");
        let urlParam = (process.env.PERIOD=='tomorrow') ? '' : `?date_req=${fxdate}/${fxmonth}/${fxyear}`;


        let fxUrl =  `${process.env.SERVICE_URL}${urlParam}`;
        let dbDate;
        //const dbDate = fxyear + '-' + fxmonth + '-' + fxdate;
        await axios.get(fxUrl,{ headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'application/json;charsrt: utf-8'},
            responseType: 'arraybuffer',
            responseEncoding: 'binary',
            timeout: 30000
        })
        .then(response => {
            let decoded = iconv.decode(Buffer.from(response.data), 'win1251');

          let ResponseObj;
          parseString(decoded, (err, result) => {
              ResponseObj = result;
            });


            const ResponseArr = ResponseObj.ValCurs.Valute;
            const exchangedate = ResponseObj.ValCurs.$.Date;
            for (let i = 0, item; item = ResponseArr[i]; ++i) {
                (async () => {
                    let fxcode = item.CharCode[0] + '/RUB';
                    let nominal = item.Nominal[0]
                    const fxrate = textToNumber(item.Value[0])/nominal;

                    let YYYY = fxyear;
                    let MM = fxmonth;
                    let DD = fxdate;
                    if (process.env.PERIOD == 'tomorrow')
                    {
                        const regexDate = /(\d+)\.(\d+)\.(\d+)/;
                            let extrDate = regexDate.exec(exchangedate);

                            if (extrDate !== null) {
                                YYYY = extrDate[3];
                                MM = extrDate[2];
                                DD = extrDate[1];
                            };
                    }

                    dbDate = YYYY + '-' + MM + '-' + DD;
                    const sql =`SELECT * FROM bankru WHERE exchangedate='${dbDate}' AND code = '${fxcode}'`;

                    await connectionFinance.query(sql)
                    .then(result => {
                        if (result[0].length > 0) return;
                        const sql ="INSERT INTO bankru (code, exchangedate, rate ) VALUES (?,?,?)"
                        const fxitem = [fxcode, dbDate, fxrate ];
                        let res = connectionFinance.query(sql, fxitem);
                        //console.log(result[0]);
                    })
                    .catch(err => {   console.log(err);    })
                })();
            } // end for

        })
        .catch(error => {
            console.log(error);
                })
        console.log(dbDate);
        await wait(3000);            // Next Request Timeout in Loop of Historic Rates dataset

        newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);


    } // End While

}) ();// end async


function wait(ms) {    return new Promise( (resolve) => {setTimeout(resolve, ms)});}
function textToNumber(text) {  return Number(text.replace(',', '.'));}


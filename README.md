# bankru - Описание RU

## Официальный курс валют и банковских металлов по данным Центрального Банка России [www.cbr.ru](https://www.cbr.ru) 

Данные [ЦБР API](https://www.cbr.ru/development/SXML/) сохраняются в локальную БД mysql

Структура таблиц описана в **db_finance.sql**

В файле **.env** задается конфигурация. 
Переименуйте файл **.env.example** -> **.env**  и задайте свои значения.
 
# bankru - Description EN

## Official exchange rate of currencies and bank metals according to the Central Bank of Russian Federation (CBR) [www.cbr.ru](https://www.cbr.ru)

FX Data from [CBR API](https://www.cbr.ru/development/SXML/) are saved in a local mysql database 

Database structure describes in  **db_finance.sql**


#### Clone & Install Dependencies
```bash
git clone https://github.com/dsunegin/bankru
cd bankru
npm install
```

Create user and database according to db_finance.sql:
```
 mysql -uroot -pROOT_PASSWORD -e 'source db_finance.sql'

```
Configure your env:
```
cp .env.example .env

```

#### Specifying a dev environment

In order to override sample `bankru` settings such as `DB_FINHOST, DB_FINUSER, DB_FINDATABASE, DB_FINPASSWORD, TODAY`  endpoints, create/copy an `.env` file in the `bankru` root directory, and declare any environment overrides you need in that file

A short explanation of a `.env` file:

```
DB_FINHOST: localhost               - mysql Host
DB_FINPORT: 3306                    - mysql Port
DB_FINUSER:  finance_user           - mysql User created by db_finance.sql
DB_FINDATABASE: finance             - Database created by db_finance.sql
DB_FINPASSWORD: psw_finance_user    - UserPassword created by db_finance.sql
PERIOD: undefined/today/tomorrow
        undefined (BY DEFAULT)     - index-fx-bankru.js will get all historic rates
        today                       - will get only FX rates for Today
        tomorrow                    - will get only FX rates for Today
```

## Running `bankru`

Either configure `bankru` to run by pm2 (node process manager)  with cron or manually start the `bankru` process.

To manually start `bankru` once it is installed:

```bash
node index-fx-bankru.js 
```

### Start the pm2 cron for Today rates

```bash
./pm2-bankru-today.sh
```
By default, cron runs every 1 hours. You can adjust it in  `pm2-bankru.sh` file.
 
**Notice:** You must have installed pm2 process manager to run pm2-bankru.sh script.

### Start the pm2 cron for Tomorrow rates

```bash
./pm2-bankru-tomorrow.sh
```
 

## Contact
Denis Sunegin `dsunegin@gmail.com`

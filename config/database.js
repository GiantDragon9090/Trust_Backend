const dotenv = require('dotenv')
const mysql2 = require('mysql2')
const util = require('util')
const md5 = require('md5')

dotenv.config()


const con = mysql2.createConnection({
    host: process.env.DBADDRESS,
    user: process.env.DBUSERNAME,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
})

const executeQuery1 = util.promisify(con.query).bind(con)

con.connect(async (err) => {
    if(err) console.log(err)
    console.log("DB connected!")
    createTables()
})



const createTables = async () =>{
    const query1 = "CREATE TABLE IF NOT EXISTS `invest` ("+
  "`id` int(11) NOT NULL AUTO_INCREMENT,"+
  "`user_id` int(11) DEFAULT NULL," +
  "`token_id` int(11) DEFAULT NULL," +
  "`amount` bigint(20) DEFAULT NULL," +
  "`designation` varchar(100) DEFAULT NULL," +
  "`investcompany` varchar(100) DEFAULT NULL," +
  "`token_amount` double DEFAULT NULL," +
  "`regdate` date DEFAULT NULL," +
  "PRIMARY KEY (`id`)"+
") ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8"
    const query2 = "CREATE TABLE IF NOT EXISTS `token` ("+
  "`id` int(11) NOT NULL AUTO_INCREMENT," +
  "`name` varchar(255) DEFAULT NULL," +
  "`logo` text DEFAULT NULL, " +
  "`symbol` varchar(20) DEFAULT NULL," +
  "`slug` varchar(100) DEFAULT NULL," +
  "`address` varchar(100) DEFAULT NULL," +
  "`description` text DEFAULT NULL,"+
  "`platform` varchar(30) DEFAULT NULL," +
  "`type` int(11) DEFAULT 0," +
  "`cmc_id` int(11) DEFAULT 0," +
  "PRIMARY KEY (`id`)" +
") ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
    const query3 = "CREATE TABLE IF NOT EXISTS `user` (" +
  "`id` int(11) NOT NULL AUTO_INCREMENT," +
  "`name` varchar(50) DEFAULT NULL," +
  "`company` varchar(100) DEFAULT NULL," +
  "`email` varchar(50) DEFAULT NULL,"+
  "`mobile` varchar(20) DEFAULT NULL,"+
  "`photo` text DEFAULT NULL,"+
  "`password` varchar(255) DEFAULT NULL,"+
  "`isAdmin` tinyint(1) DEFAULT 0,"+
  "PRIMARY KEY (`id`),"+
  "UNIQUE KEY `email` (`email`)"+
") ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;"
    const query4 = "Insert Ignore into user(name, email, password, isAdmin) VALUES('admin', 'giantdragon9090@gmail.com', '"+md5('123456')+"',1)"
    await executeQuery1(query1)
    await executeQuery1(query2)
    await executeQuery1(query3)
    await executeQuery1(query4)
}

const executeQuery = (value) => {
    try{
        return executeQuery1(value)
    }catch(e){
        console.log(e)
        return e
    }
}

module.exports = {executeQuery}
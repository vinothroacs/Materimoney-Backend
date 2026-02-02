const mysql=require("mysql2")

const db = mysql.createConnection({
    host:'localhost',
    user:'roacs',
    password:'Matrimony2025',
    database:'matrimonydb'
})

db.connect((err)=>{if(err){
    console.log('mysql connection failded')
}

else{
    console.log('my connect')
}})

module.exports =dbṣ
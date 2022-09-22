const mongoose = require("mongoose");




const connectDatabase = async() => {
   
// mongoose.connect(process.env.DB_URI , {useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex : true}).then((data) => {
//     console.log(`Mongodb connected with server: ${data.connection.host}`)
//  }).catch((err) => {
//     console.log(err)
//  })
 

await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true , useUnifiedTopology: true , useCreateIndex : true
})
.then((data) =>  console.log(`Mongodb connected with server: ${data.connection.host}`) )

.catch((err) => console.log(err))
   

}




module.exports = connectDatabase







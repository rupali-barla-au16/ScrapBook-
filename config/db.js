const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://adyyatlas:deep1206@cluster0.5jghz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{
    useNewUrlParser:true,useUnifiedTopology:true
}).then(()=>{
    console.log('connected to database')
}).catch(err =>{
    console.log('something is wrong in database')
process.exit()
})
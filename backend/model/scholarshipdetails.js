const mongoose=require('mongoose')

const scholarshipdetailsSchema=mongoose.Schema({
    title: {
        type:String,
        required:true
    },
  eligibility: {
        type:String,
        required:true
    },
  country: {
        type:String,
        required:true
    },
  award: {
        type:String,
        required:true
    },
  deadline: {
        type:String,
        required:true
    },
  undergraduate: {
        type:Number,
        required:true
    },
  postgraduate: {
        type:Number,
        required:true
    },
  doctoral:{
        type:Number,
        required:true
    },
  url: {
        type:String,
        required:true
    }
});

const scholarshipdetails = mongoose.model('scholarshipdetails',scholarshipdetailsSchema)

module.exports=scholarshipdetails
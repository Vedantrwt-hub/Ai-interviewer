const mongoose = require('mongoose')

const technicalQunSchema = new mongoose.Schema({
  question:{
    type:String,
    required : [true , "Technical question is required"]
  },

  intention:{
    type:String,
    required : [true , "Intention is required"]
  },
  answer:{
    type:String,
    required : [true , "Answer is required"]
  }
},{
    _id:false
  })

  const behavioralQunSchema = new mongoose.Schema({

      question:{
        type:String,
        required : [true , "Technical question is required"]
      },

      intention:{
        type:String,
        required : [true , "Intention is required"]
      },
      answer:{
        type:String,
        required : [true , "Answer is required"]
  }
  },{
    _id:false
  })

  const skillgapSchema = new mongoose.Schema({

    skill:{
      type:String,
      required : [true,"skill is required"]
    },
    severity:{
      type:String,
      enum: ['low', 'medium', 'high'],
      required : [true,"severity is required"]
    }
  },{
    _id:false
  }) 

  const preparationplanSchema = new mongoose.Schema({
    day:{
      type:Number,
      required : [true,"day is required"]   
    },
    focus:{
      type:String,
      required : [true,"focus is required"]
  },
  tasks:{
    type:String,
    required : [true,"tasks is required"]
  }
},{
    _id:false
  } )

  const interviewReportSchema = new mongoose.Schema({
    jobDescription:{
      type:String,
      required : [true,"jobDescription is required"]
  },
    resume:{
      type:String,
      required : [true,"resume is required"]
    },
    selfDescription:{
      type:String,
      required : [true,"selfDescription is required"]
    },
    matchScore:{
      type:Number,
      min:0,
      max:100
    },
    technicalQuestions:[technicalQunSchema],
    behavioralQuestions:[behavioralQunSchema],
    skillGaps:[skillgapSchema],
    preparationPlan:[preparationplanSchema],
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"users"
    },
    title:{
      type:String,
      required : [true,"title is required"]
    }
},{
  timestamps:true 
})

const interviewReportModel = mongoose.model('InterviewReport', interviewReportSchema)

module.exports = interviewReportModel;
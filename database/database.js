// Mor Yossef - 209514264
// Rinat Polonski - 313530842
// Shir Davidov - 318852159

const mongoose = require('mongoose');
const {Schema} = require("mongoose");
require('dotenv').config();

// Set 'strictQuery' to suppress deprecation warning
mongoose.set('strictQuery', false);

// Set Mongoose to use the global Promise library
mongoose.Promise = global.Promise;

// MongoDB Atlas connection URI
const username = process.env.USER_NAME;
const password = process.env.PASSWORD;
const uri = `mongodb+srv://${username}:${password}@cluster0.b0sv4ew.mongodb.net/ServerDatabase?retryWrites=true&w=majority`;

// Connect to MongoDB Atlas using Mongoose
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true,})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
    });

// Create the required collections
const schema = mongoose.Schema;

// Create the users schema
const usersSchema = new schema({
    id: { type: Number },
    first_name: { type: String },
    last_name: { type: String },
    birthday: { type: String },
});

// Create the costs schema
const costsSchema = new schema({
  user_id: {
    type: Number,
    require: true,
  },
  year: {
    type: Number,
    required: false,
    validate: {
      validator: validateYear,
      message: 'Invalid date value. Year must be between 1900 and 2300.',
    },
  },
  month: {
    type: Number,
    required: false,
    validate: {
      validator: validateMonth,
      message: 'Invalid date value. Month must be between 1 and 12.',
    },
  },
  day: {
    type: Number,
    required: false,
    validate: {
      validator: validateDay,
      message: 'Invalid date value. Day must be between 1 and 31.',
    },
  },
  id: { type: Schema.Types.ObjectId, auto: true },
  description: String,
  category: {
    type: String,
    enum: [
      'food',
      'health',
      'housing',
      'sport',
      'education',
      'transportation',
      'other',
    ],
  },
  sum: Number,
});

// Create the report schema

const reportsSchema = new schema({
  user_id: { type: Number, required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  report: {
    type: JSON,
    required: true,
    default: {
      food: [],
      health: [],
      housing: [],
      sport: [],
      education: [],
      transportation: [],
      other: [],
    },
  },
});

// create the models for the schemas
const users = mongoose.model("users", usersSchema);
const costs = mongoose.model("costs", costsSchema);
const reports = mongoose.model("reports", reportsSchema);

module.exports = users;
module.exports = costs;
module.exports = reports;


// Those functions validate the date

// Validation function for year
function validateYear(value) {
  return value >= 1900 && value <= 2023;
}

// Validation function for month
function validateMonth(value) {
  return value >= 1 && value <= 12;
}

// Validation function for day
function validateDay(value) {
  return value >= 1 && value <= 31;
}

// This function checks if the user exist in the database

const isUserExist = async (userId) => {
  return new Promise((resolve, reject) => {
    users.findOne({ id: userId }, function (error, user) {
      if (error) {
        console.error(error);
        const errorResponse = {
          error: "An error occurred while checking user existence"
        };
        reject(JSON.stringify(errorResponse));
      } else if (user) {
        console.log("User was found");
        resolve(true);
      } else {
        console.log("User was not found");
        resolve(false);
      }
    });
  });
};

// This function check that the category is valid
const validateCategory = (category) => {
  const validCategories = [
    'food',
    'health',
    'housing',
    'sport',
    'education',
    'transportation',
    'other',
  ];
  return validCategories.includes(category);
};

// This function create new user
const createNewUser = async (id, firstName, lastName, birthday) => {
  let userExist = await isUserExist(id);
  if (userExist) {
    console.log("This user already exist in the database");
    return;
  }
  const user = new users({
    id: id,
    first_name: firstName,
    last_name: lastName,
    birthday: birthday,
  });
  await user.save(function (error) {
    if (error) {
      console.error(error);
    } else {
      console.log("The user added successfully to the database");
    }
  });
};

// We created the imaginary user to the database with the required data
createNewUser(123123, "moshe", "israeli", "January, 10th, 1990");


// This function adds new cost to the costs collection
const addNewCost = async (user_id, year, month, day, description, category, sum) => {
  return new Promise(async (resolve, reject) => {
    //check if the user exists
    let userExists = await isUserExist(user_id);
    if (!userExists) {
      return reject({ error: true, message: 'User does not exist in the database' });
    }
    // Check if category is valid
    if (!validateCategory(category)) {
      return reject({ error: true, message: 'Invalid category' });
    }
    if (!validateYear(year)) {
      return reject({ error: true, message: 'Invalid date, change year' });
    }
    if (!validateDay(day)) {
      return reject({ error: true, message: 'Invalid date, change day' });
    }
    if (!validateMonth(month)) {
      return reject({ error: true, message: 'Invalid date, change month' });
    }

    //create the new cost and save it in the costs collection
    const cost = new costs({
      user_id: user_id,
      year: year,
      month: month,
      day: day,
      description: description,
      category: category,
      sum: sum,
    });

    await cost.save(function (error) {
      if (error) {
        return reject({ error: true, message: 'Cost validation failed' });
      } else {
        console.log("Cost added successfully to the database");
      }
    });

    // check if there is an existing report for the matching user_id, month and year and update it
    const existingReport = await reports.findOne({
      user_id: user_id,
      year: year,
      month: month,
    });
    if (existingReport) {
      await existingReport.report[`${category}`].push({
        day: day,
        description: description,
        sum: sum,
      });
      await reports.updateOne(
          { user_id: user_id, year: year, month: month },
          { report: existingReport.report }
      );
    }
    resolve(cost);
  });
};


// This function creates a new report
const generateNewReport = async (user_id, month, year) => {
  return new Promise(async (resolve, reject) => {
    //check if the user exists
    let userExists = await isUserExist(user_id);
    if (!userExists) {
      return reject({ error: true, message: 'User not exists' });
    }
     //Check if valid date
    if (!validateYear(year)) {
      return reject({ error: true, message: 'Invalid date, change year' });
    }
    if (!validateMonth(month)) {
      return reject({ error: true, message: 'Invalid date, change month' });
    }
    //Check if the requested report already exists and returning it
    let existingReport = await reports.findOne({
      user_id: user_id,
      year: year,
      month: month,
    });
    if (existingReport) {
      resolve(existingReport["report"]);
      return;
    }

    // Check if there are costs for the requested user_id, month and year so that we can create a new report
    let res = await costs.find({ user_id: user_id, year: year, month: month });

    // Create the new report for each cost that matches the requested user_id, month and year
    const newReport = await new reports({
      user_id: user_id,
      year: year,
      month: month,
    });
    await res.forEach((cost) => {
      newReport.report[cost.category].push({
        day: cost.day,
        description: cost.description,
        sum: cost.sum,
      });
    });

    // Save the report we just created, so we can update it and return it if requested
    // instead of creating a new report on each request
    await newReport.save(function (error) {
      if (error) {
        return reject({ error: true, message: 'Problem saving the report successfully' });
      } else {
        console.log("Report was saved successfully");
      }
    });
    resolve(newReport.report);
  });
};

module.exports = { addNewCost, generateNewReport };

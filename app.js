// Mor Yossef - 209514264
// Rinat Polonski - 313530842
// Shir Davidov - 318852159

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");


var addcostRouter = require("./routes/addcost");
var aboutRouter = require("./routes/about");
var reportRouter = require("./routes/report");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Enable CORS
const cors = require('cors');
app.use(cors());


app.use("/addcost", addcostRouter);
app.use("/report", reportRouter);

app.use("/about", aboutRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

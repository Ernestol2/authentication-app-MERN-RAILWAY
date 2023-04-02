const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./auth");

//db connection
dbConnect();

//restriction cores error
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

app.post("/register", (req, res) => {
  
  User.findOne({ email: req.body.email })
    .then((user) => {
      if(user) {
        bcrypt
          .compare(req.body.password, user.password)
          .then((passwordCheck) => {
            if(passwordCheck) {
              console.log({ message: "usuario y contraseña validos" });
              res.json({ message: "Usuario Registrado, puede hacer login" })
            }
          })
      } else {
        bcrypt
        .hash(req.body.password, 10)
        .then((hashPassword) => {
          const user = new User({
            email: req.body.email,
            password: hashPassword,
          });
          user
            .save()
            .then((result) => {
              res.status(201).send({
                message: "Usuario creado Exitosamente",
                result,
              });
            })
            .catch((err) => {
              res.status(500).send({
                message: "Error creando el usuario",
                err,
              });
            });
        })
        .catch((e) => {
          res.status(500).send({
            message: "Contraseña no fue encryptada",
            e,
          });
        });
      }
  })
});

app.post("/login", (req, res) => {

  User.findOne({email: req.body.email})
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          if(!passwordCheck) {
            return res.status(400).send({
              message: "password does not match",
              error,
            });
          }

          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          res.status(200).send({
            message: "login succesful",
            email: user.email,
            token,
          });
        }) 
        .catch((err) => {
          res.status(400).send({
            message: "password does not match",
            err,
          })
        })
    })
    .catch((e) => {
      res.status(404).send({
        message: "email not found",
        e,
      })
    })
})

// endpoint libre
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "Bienvenido a la RUTA LIBRE" });
});

// endpoint autenticado
app.get("/auth-endpoint", auth, (request, response) => {
  response.json({ message: "Bienvenido a la RUTA PRIVADA" });
});


module.exports = app;
const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const NotesTodoService = require("./notesTodo-service");
const notesTodoRouter = express.Router();
const bodyParser = express.json();

const serializeNote = (todo) => ({
  id: todo.id,
  title: xss(todo.title),
  todo: todo.todo,
  completed: todo.completed,
});

notesTodoRouter.route("/").get((req, res, next) => {
  console.log("Calling get all");
  NotesTodoService.getAllTodo(req.app.get("db"))
    .then((todos) => {
      res.json(todos.map(serializeNote));
    })
    .catch(next);
});

module.exports = notesTodoRouter;

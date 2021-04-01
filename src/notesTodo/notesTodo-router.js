const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const NotesTodoService = require("./notesTodo-service");
const notesTodoRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (todo) => ({
  id: todo.id,
  title: xss(todo.title),
  todo: todo.todo,
  completed: todo.completed,
});

notesTodoRouter
  .route("/")
  .get((req, res, next) => {
    console.log("Calling get all");
    NotesTodoService.getAllTodo(req.app.get("db"))
      .then((todos) => {
        res.json(todos.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, completed = false, todo } = req.body;
    const newTodo = { title, todo };

    for (const [key, value] of Object.entries(newTodo))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    newTodo.completed = completed;

    NotesTodoService.insertTodo(req.app.get("db"), newTodo)
      .then((todo) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${todo.id}`))
          .json(serializeTodo(todo));
      })
      .catch(next);
  });

notesTodoRouter
  .route("/:todo_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.todo_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` },
      });
    }
    TodoService.getByIdAndTitle(req.app.get("db"), req.params.todo_id)
      .then((todo) => {
        if (!todo) {
          return res.status(404).json({
            error: { message: `Todo doesn't exist` },
          });
        }
        res.todo = todo;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeTodo(res.todo));
  })
  .delete((req, res, next) => {
    TodoService.deleteTodo(req.app.get("db"), req.params.todo_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, completed, todo } = req.body;
    const todoToUpdate = { title, completed, todo };

    const numberOfValues = Object.values(todoToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'todo', 'title' or 'completed'`,
        },
      });

    TodoService.updateTodo(req.app.get("db"), req.params.todo_id, todoToUpdate)
      .then((updatedTodo) => {
        res.status(200).json(serializeTodo(updatedTodo[0]));
      })
      .catch(next);
  });

module.exports = notesTodoRouter;

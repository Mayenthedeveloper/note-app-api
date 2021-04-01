const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const NotesService = require("./notes-service");

const noteRouter = express.Router();
const bodyParser = express.json();

const serializeNote = (note) => ({
  id: note.id,
  title: xss(note.title),
  notepad: note.notepad,
  description: xss(note.description),
});

noteRouter
  .route("/")

  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get("db"))
      .then((notes) => {
        // console.log("All notes");
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })

  .post(bodyParser, (req, res, next) => {
    const { title, notepad, description } = req.body;
    const newNote = { title, notepad, description };

    for (const field of ["title", "notepad"]) {
      if (!newNote[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` },
        });
      }
    }

    NotesService.insertNote(req.app.get("db"), newNote)
      .then((note) => {
        logger.info(`note with id ${note.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route("/:note_id")

  .all((req, res, next) => {
    const { note_id } = req.params;
    NotesService.getById(req.app.get("db"), note_id)
      .then((note) => {
        if (!note) {
          logger.error(`note with id ${note_id} not found.`);
          return res.status(404).json({
            error: { message: `note Not Found` },
          });
        }

        res.note = note;
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(serializeNote(res.note));
  })

  .delete((req, res, next) => {
    const { note_id } = req.params;
    console.log(note_id);
    NotesService.deleteNote(req.app.get("db"), note_id)
      .then((numRowsAffected) => {
        logger.info(`note with id ${note_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const { title, notepad, description } = req.body;
    const noteToUpdate = { title, notepad };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title', 'note', 'description'`,
        },
      });
    }
    console.log("OK");

    NotesService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
      .then((numRowsAffected) => {
        console.log(numRowsAffected);
        res.status(200).end();
      })
      .catch(next);
  });

module.exports = noteRouter;

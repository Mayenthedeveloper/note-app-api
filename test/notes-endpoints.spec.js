const knex = require("knex");
const fixtures = require("./notes-fixtures");
const app = require("../src/app");

describe("Notes Endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  // console.log(db);

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => db("notes").truncate());

  afterEach("cleanup", () => db("notes").truncate());

  describe(`Unauthorized requests`, () => {
    const testNotes = fixtures.makeNotesArray();
    console.log("Ok til here");
    beforeEach("insert notes", () => {
      return db.into("notes").insert(testNotes);
    });

    // it(`responds with 401 Unauthorized for GET /api/notes`, () => {
    //   return supertest(app)
    //     .get("/api/notes")
    //     .expect(401, { error: "Unauthorized request" });
    // });

    // it(`responds with 401 Unauthorized for POST /api/notes`, () => {
    //   return supertest(app)
    //     .post("/api/notes")
    //     .send({ title: "test-title", notepad: "you there" })
    //     .expect(401, { error: "Unauthorized request" });
    // });

    // it(`responds with 401 Unauthorized for GET /api/notes/:id`, () => {
    //   const secondNote = testNotes[1];
    //   return supertest(app)
    //     .get(`/api/notes/${secondNote.id}`)
    //     .expect(401, { error: "Unauthorized request" });
    // });

    // it(`responds with 401 Unauthorized for DELETE /api/notes/:id`, () => {
    //   const aNote = testNotes[1];
    //   return supertest(app)
    //     .delete(`/api/notes/${aNote.id}`)
    //     .expect(401, { error: "Unauthorized request" });
    // });

    // it(`responds with 401 Unauthorized for PATCH /api/notes/:id`, () => {
    //   const aNote = testNotes[1];
    //   return supertest(app)
    //     .patch(`/api/notes/${aNote.id}`)
    //     .send({ title: "updated-title" })
    //     .expect(401, { error: "Unauthorized request" });
    // });
  });

  describe("GET /api/notes", () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/notes").expect(200, []);
      });
    });

    context("Given there are notes in the database", () => {
      const testNotes = fixtures.makeNotesArray();

      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });

      it("gets the notes from the store", () => {
        return supertest(app)
          .get("/api/notes")

          .expect(200, testNotes);
      });
    });
  });

  describe.only("GET /api/notes/:id", () => {
    context(`Given no notes`, () => {
      it.only(`responds 404 whe note doesn't exist`, () => {
        return supertest(app)
          .get(`/api/notes/123`)

          .expect(404, {
            error: { message: `Note Not Found` },
          });
      });
    });

    context("Given there are notes in the database", () => {
      const testNotes = fixtures.makeNotesArray();

      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });

      it("responds with 200 and the specified note", () => {
        const noteId = 2;
        const expectedNote = testNotes[noteId - 1];
        return supertest(app)
          .get(`/api/notes/${noteId}`)

          .expect(200, expectedNote);
      });
    });
  });

  describe("DELETE /api/notes/:id", () => {
    context(`Given no notes`, () => {
      it(`responds 404 whe note doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/notes/123`)

          .expect(404, {
            error: { message: `note Not Found` },
          });
      });
    });

    context("Given there are notes in the database", () => {
      const testNotes = fixtures.makeNotesArray();

      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });

      it("removes the note by ID from the store", () => {
        const idToRemove = 2;
        const expectedNotes = testNotes.filter((bm) => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/notes`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedNotes)
          );
      });
    });
  });

  describe("POST /api/notes", () => {
    ["title", "notepad", "rating"].forEach((field) => {
      const newNote = {
        title: "test-title",
        notepad: "test",
      };

      it(`responds with 400 missing '${field}' if not supplied`, () => {
        delete newNote[field];

        return supertest(app)
          .post(`/api/notes`)
          .send(newBookmark)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(400, {
            error: { message: `'${field}' is required` },
          });
      });
    });

    it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
      const newNoteInvalidRating = {
        title: "test-title",
        notepad: "notesss",
      };
      return supertest(app)
        .post(`/api/notes`)
        .send(newNoteInvalidRating)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(400, {
          error: { message: `'rating' must be a number between 0 and 5` },
        });
    });

    it(`responds with 400 invalid 'notepad' if not a valid notepad`, () => {
      const newNoteInvalidUrl = {
        title: "test-title",
        notepad: "notepad invalid",
      };
      return supertest(app)
        .post(`/api/notes`)
        .send(newNoteInvalidUrl)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(400, {
          error: { message: `'notepad' must be a valid notepad` },
        });
    });

    it("adds a new note to the store", () => {
      const newNote = {
        title: "test-title",
        notepad: "note pad",
        description: "test description",
      };
      return supertest(app)
        .post(`/api/notes`)
        .send(newBookmark)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newNote.title);
          expect(res.body.notepad).to.eql(newNote.notepad);
          expect(res.body.description).to.eql(newNote.description);
          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/notes/${res.body.id}`)
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
        );
    });

    it("removes XSS attack content from response", () => {
      const { maliciousNote, expectedNote } = fixtures.makeMaliciousBookmark();
      return supertest(app)
        .post(`/api/notes`)
        .send(maliciousNote)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(expectedNote.title);
          expect(res.body.description).to.eql(expectedNote.description);
        });
    });
  });

  describe(`PATCH /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .patch(`/api/notes/${noteId}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .expect(404, { error: { message: `note Not Found` } });
      });
    });

    context("Given there are notes in the database", () => {
      const testNotes = fixtures.makeNotesArray();

      beforeEach("insert notes", () => {
        return db.into("notes").insert(testNotes);
      });

      it("responds with 204 and updates the note", () => {
        const idToUpdate = 2;
        const updateNote = {
          title: "updated note title",
          notepad: "notepad12",
          description: "updated note description",
        };
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updateNote,
        };
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(updateNote)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedArticle)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must content either 'title', 'notepad', 'description' or 'rating'`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateNote = {
          title: "updated note title",
        };
        const expectedNote = {
          ...testNotes[idToUpdate - 1],
          ...updateNote,
        };

        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send({
            ...updateNote,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)
              .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedNote)
          );
      });

      it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
        const idToUpdate = 2;
        const updateInvalidRating = {
          rating: "invalid",
        };
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(updateInvalidRating)
          .expect(400, {
            error: {
              message: `'rating' must be a number between 0 and 5`,
            },
          });
      });

      it(`responds with 400 invalid 'notepad' if not a valid notepad`, () => {
        const idToUpdate = 2;
        const updateInvalidUrl = {
          notepad: "notepad12",
        };
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)
          .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
          .send(updateInvalidUrl)
          .expect(400, {
            error: {
              message: `'notepad' must be a valid notepad`,
            },
          });
      });
    });
  });
});

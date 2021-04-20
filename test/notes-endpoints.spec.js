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

  describe("GET /api/notes/:id", () => {
    context(`Given no notes`, () => {
      it(`responds 404 whe note doesn't exist`, () => {
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
            error: { message: `Note Not Found` },
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

          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/notes`)

              .expect(expectedNotes)
          );
      });
    });
  });

  describe("POST /api/notes", () => {
    ["title", "notepad"].forEach((field) => {
      const newNote = {
        title: "test-title",
        notepad: "test",
      };

      it(`responds with 400 missing '${field}' if not supplied`, () => {
        delete newNote[field];

        return supertest(app)
          .post(`/api/notes`)
          .send(newNote)

          .expect(400, {
            error: { message: `'${field}' is required` },
          });
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
        .send(newNote)

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

            .expect(res.body)
        );
    });
  });

  describe(`PATCH /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456;
        return supertest(app)
          .patch(`/api/notes/${noteId}`)

          .expect(404, { error: { message: `Note Not Found` } });
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

          .send(updateNote)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)

              .expect(expectedNote)
          );
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/notes/${idToUpdate}`)

          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must content either 'title', 'notepad', 'description'`,
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

          .send({
            ...updateNote,
            fieldToIgnore: "should not be in GET response",
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/notes/${idToUpdate}`)

              .expect(expectedNote)
          );
      });
    });
  });
});

const knex = require("knex");
const fixtures = require("./notesTodo-fixtures");
const app = require("../src/app");

describe("Todo Endpoints", () => {
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

  before("cleanup", () => db("notestodo").truncate());

  afterEach("cleanup", () => db("notestodo").truncate());

  describe(`Unauthorized requests`, () => {
    const testTodos = fixtures.makeNotesTodoArray();

    beforeEach("insert notestodo", () => {
      return db.into("notestodo").insert(testTodos);
    });
  });

  describe("GET /api/todo", () => {
    context(`Given no todos`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/todo").expect(200, []);
      });
    });

    context("Given there are todos in the database", () => {
      const testTodos = fixtures.makeNotesTodoArray();

      beforeEach("insert todos", () => {
        return db.into("notestodo").insert(testTodos);
      });

      it("gets the todo from the store", () => {
        return supertest(app)
          .get("/api/todo")

          .expect(200, testTodos);
      });
    });
  });

  describe("GET /api/todo/:id", () => {
    context(`Given no todo`, () => {
      it(`responds 404 whe todo doesn't exist`, () => {
        return supertest(app)
          .get(`/api/todo/123`)

          .expect(404, {
            error: { message: `Todo Not Found` },
          });
      });
    });

    context("Given there are todos in the database", () => {
      const testTodos = fixtures.makeNotesTodoArray();

      beforeEach("insert todos", () => {
        return db.into("todo").insert(testTodos);
      });

      it("responds with 200 and the specified todo", () => {
        const todoId = 2;
        const expectedTodo = testTodos[todoId - 1];
        return supertest(app)
          .get(`/api/todo/${todoId}`)

          .expect(200, expectedTodo);
      });
    });
  });

  describe("DELETE /api/todo/:id", () => {
    context(`Given no todo`, () => {
      it(`responds 404 whe todo doesn't exist`, () => {
        return supertest(app)
          .delete(`/api/todo/123`)

          .expect(404, {
            error: { message: `Todo Not Found` },
          });
      });
    });

    context("Given there are todo in the database", () => {
      const testTodos = fixtures.makeNotesTodoArray();

      beforeEach("insert todo", () => {
        return db.into("todo").insert(testTodos);
      });

      it("removes the note by ID from the store", () => {
        const idToRemove = 2;
        const expectedTodos = testTodos.filter((bm) => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/api/todo/${idToRemove}`)

          .expect(204)
          .then(() =>
            supertest(app)
              .get(`/api/todo`)

              .expect(expectedTodos)
          );
      });
    });
  });

  describe("POST /api/todo", () => {
    ["title", "notepad"].forEach((field) => {
      const newTodo = {
        title: "test-title",
        todo: "test",
      };

      it(`responds with 400 missing '${field}' if not supplied`, () => {
        delete newTodo[field];

        return supertest(app)
          .post(`/api/todo`)
          .send(newTodo)

          .expect(400, {
            error: { message: `'${field}' is required` },
          });
      });
    });

    it("adds a new todo to the store", () => {
      const newTodo = {
        title: "test-title",
        todo: "note pad",
        completed: false,
      };
      return supertest(app)
        .post(`/api/todo`)
        .send(newTodo)

        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newTodo.title);
          expect(res.body.todo).to.eql(newTodo.todo);

          expect(res.body).to.have.property("id");
          expect(res.headers.location).to.eql(`/api/todo/${res.body.id}`);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/todo/${res.body.id}`)

            .expect(res.body)
        );
    });
  });

  describe(`PATCH /api/todo/:todo_id`, () => {
    context(`Given no todo`, () => {
      it(`responds with 404`, () => {
        const todoId = 123456;
        return supertest(app)
          .patch(`/api/todo/${todoId}`)

          .expect(404, { error: { message: `Todo Not Found` } });
      });
    });

    context("Given there are todo in the database", () => {
      const testTodos = fixtures.makeNotesTodoArray();

      beforeEach("insert todo", () => {
        return db.into("todo").insert(testTodos);
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/todo/${idToUpdate}`)

          .send({ irrelevantField: "foo" })
          .expect(400, {
            error: {
              message: `Request body must content either 'title', 'todo'`,
            },
          });
      });
    });
  });
});

const NotesTodoService = {
  getAllTodo(knex) {
    console.log("Knexxx");
    console.log(knex);
    return knex.select("*").from("notestodo");
  },
  getById(knex, id) {
    return knex.from("notestodo").select("*").where("id", id).first();
  },
  getByIdAndTitle(knex, id, title) {
    return knex
      .from("notestodo")
      .select("*")
      .where("id", id)
      .and("title", title)
      .first();
  },
  insertNote(knex, newTodo) {
    return knex
      .insert(newTodo)
      .into("notestodo")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  deleteNote(knex, id) {
    return knex("notestodo").where({ id }).delete();
  },
  updateNote(knex, id, newNoteFields) {
    return knex("notestodo").where({ id }).update(newNoteFields);
  },
};

module.exports = NotesTodoService;

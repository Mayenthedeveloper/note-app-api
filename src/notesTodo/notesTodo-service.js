const NotesTodoService = {
  getAllTodo(knex) {
    return knex.select("*").from("notestodo");
  },
  getById(knex, id) {
    return knex.from("notestodo").select("*").where("id", id).first();
  },

  insertTodo(knex, newTodo) {
    return knex
      .insert(newTodo)
      .into("notestodo")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  deleteTodo(knex, id) {
    return knex("notestodo").where({ id }).delete();
  },
  updateTodo(knex, id, newNoteFields) {
    return knex("notestodo").where("id", id).update(newNoteFields);
  },
};

module.exports = NotesTodoService;

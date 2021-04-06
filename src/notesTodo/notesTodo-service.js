const NotesTodoService = {
  getAllTodo(knex) {
    return knex.select("*").from("notestodo");
  },
  getById(knex, id) {
    return knex.from("notestodo").select("*").where("id", id).first();
  },
  // getByIdAndTitle(knex, id, title) {
  //   return knex
  //     .from("notestodo")
  //     .select("*")
  //     .where("id", id)
  //     .andWhere("title", title)
  //     .first();
  // },
  insertTodo(knex, newTodo) {
    console.log(newTodo);
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
    console.log("Running update SQL ");
    return knex("notestodo").where({ id }).update(newNoteFields);
  },
};

module.exports = NotesTodoService;

function makeNotesTodoArray() {
  return [
    {
      id: 1,
      title: "cooking",
      todo: "cooking for birthday this weekend",
      completed: false,
    },
    {
      id: 2,
      title: "drawing",
      todo: "teaching drawing classes at the mall",
      completed: false,
    },
    {
      id: 3,
      title: "hiking",
      todo: "hiking this weekend",
      completed: false,
    },
  ];
}

module.exports = {
  makeNotesTodoArray,
};

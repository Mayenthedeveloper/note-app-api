const { v4: uuid } = require("uuid");

const notes = [
  {
    id: uuid(),
    title: "cooking",
    notepad: "cooking for birthday this weekend",
    description: "John's birthday",
  },
  {
    id: uuid(),
    title: "drawing",
    notepad: "teaching drawing classes at the mall",
    description: "washington square",
  },
  {
    id: uuid(),
    title: "hiking",
    notepad: "hiking this weekend",
    description: "hiking",
  },
];

module.exports = { notes };

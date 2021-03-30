function makeNotesArray() {
  return [
    {
      id: 1,
      title: "cooking",
      notepad: "cooking for birthday this weekend",
      description: "John's birthday",
    },
    {
      id: 2,
      title: "drawing",
      notepad: "teaching drawing classes at the mall",
      description: "washington square",
    },
    {
      id: 3,
      title: "hiking",
      notepad: "hiking this weekend",
      description: "hiking",
    },
  ];
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    notepad: "you there",
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedNote = {
    ...maliciousNote,
    title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousNote,
    expectedNote,
  };
}

module.exports = {
  makeNotesArray,
  makeMaliciousNote,
};

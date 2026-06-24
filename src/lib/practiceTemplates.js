// Practice step templates for different instrument types
export const practiceTemplates = {
  Piano: [
    {
      step_number: 1,
      title: "Clap rhythm first",
      description: "Clap out the rhythm without playing the notes",
    },
    {
      step_number: 2,
      title: "Say note names",
      description: "Say the note names out loud in rhythm",
    },
    {
      step_number: 3,
      title: "Play hands together",
      description: "Play the full piece with both hands",
    },
    {
      step_number: 4,
      title: "Full performance",
      description: "Play through the entire piece at performance tempo",
    },
  ],
  Violin: [
    {
      step_number: 1,
      title: "Bow hold review",
      description: "Check bow hold and position",
    },
    {
      step_number: 2,
      title: "Practice open strings",
      description: "Practice the open strings needed for this piece",
    },
    {
      step_number: 3,
      title: "Play with reference",
      description: "Play along with reference recording at tempo",
    },
    {
      step_number: 4,
      title: "Full performance",
      description: "Play through cleanly without reference",
    },
  ],
  Guitar: [
    {
      step_number: 1,
      title: "Learn chord shapes",
      description: "Practice each chord shape separately",
    },
    {
      step_number: 2,
      title: "Chord transitions",
      description: "Practice smooth transitions between chords",
    },
    {
      step_number: 3,
      title: "Play with strumming pattern",
      description: "Add the strumming pattern to the chords",
    },
    {
      step_number: 4,
      title: "Full performance",
      description: "Play through the entire song smoothly",
    },
  ],
  Voice: [
    {
      step_number: 1,
      title: "Warm up",
      description: "Do vocal warm-ups and scales",
    },
    {
      step_number: 2,
      title: "Learn the melody",
      description: "Learn the melody line note by note",
    },
    {
      step_number: 3,
      title: "Add lyrics",
      description: "Combine melody with lyrics",
    },
    {
      step_number: 4,
      title: "Full performance",
      description: "Perform the song with expression and dynamics",
    },
  ],
  Custom: [
    {
      step_number: 1,
      title: "Step 1",
      description: "Add your own practice steps",
    },
  ],
};

export const instrumentTypes = [
  "Piano",
  "Violin",
  "Guitar",
  "Voice",
  "Custom",
];

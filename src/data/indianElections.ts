export interface ElectionPhase {
  id: string;
  title: string;
  date: string;
  description: string;
  isPast: boolean;
}

export interface ElectionData {
  region: string;
  type: string;
  phases: ElectionPhase[];
  deadlines: {
    voterRegistration: string;
    correction: string;
  };
  myths: {
    id: string;
    myth: string;
    fact: string;
  }[];
  documentsRequired: string[];
}

export const mockIndianElectionData: ElectionData = {
  region: "India (National)",
  type: "Lok Sabha Elections",
  phases: [
    {
      id: "phase1",
      title: "Voter Registration Deadline",
      date: "2026-03-15",
      description: "Last day to apply for a new Voter ID (EPIC card) or update details.",
      isPast: true,
    },
    {
      id: "phase2",
      title: "Publication of Final Voter List",
      date: "2026-04-01",
      description: "Check your name in the final electoral roll. If it's not there, you cannot vote.",
      isPast: true,
    },
    {
      id: "phase3",
      title: "Polling Day",
      date: "2026-05-15",
      description: "Go to your designated polling booth to cast your vote using EVM.",
      isPast: false,
    },
    {
      id: "phase4",
      title: "Counting of Votes",
      date: "2026-06-04",
      description: "Results are declared.",
      isPast: false,
    }
  ],
  deadlines: {
    voterRegistration: "2026-03-15",
    correction: "2026-03-10",
  },
  myths: [
    {
      id: "m1",
      myth: "I can vote with just my Aadhaar card even if my name is not on the voter list.",
      fact: "False. Your name MUST be on the electoral roll. An Aadhaar card can be used as an identity proof at the booth, but only if you are registered on the voter list."
    },
    {
      id: "m2",
      myth: "I can register to vote online in 5 minutes.",
      fact: "While you can apply online (Form 6 on the Voter Helpline app or NVSP portal), it takes a few weeks for the Booth Level Officer (BLO) to verify and approve it."
    },
    {
      id: "m3",
      myth: "If I press the NOTA button, and NOTA gets the maximum votes, there will be a re-election.",
      fact: "False. In India, even if NOTA gets the highest votes, the candidate with the next highest votes is declared the winner. NOTA is purely for expressing dissatisfaction."
    }
  ],
  documentsRequired: [
    "EPIC (Voter ID Card)",
    "Aadhaar Card",
    "PAN Card",
    "Driving License",
    "Indian Passport",
    "Passbook with photograph issued by Bank/Post Office"
  ]
};

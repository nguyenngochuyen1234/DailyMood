export interface Mood {
  id: number;
  code: string;
  icon: any;
  textVi: string;
  textEng: string;
}

export const MOODS: Mood[] = [
  {
    id: 0,
    code: "happy",
    icon: require("../assets/icon/icon1.png"),
    textVi: "Vui vẻ",
    textEng: "Happy",
  },
  {
    id: 1,
    code: "sad",
    icon: require("../assets/icon/icon2.png"),
    textVi: "Buồn",
    textEng: "Sad",
  },
  {
    id: 2,
    code: "neutral",
    icon: require("../assets/icon/icon3.png"),
    textVi: "Bình thường",
    textEng: "Neutral",
  },
  {
    id: 3,
    code: "excited",
    icon: require("../assets/icon/icon4.png"),
    textVi: "Phấn khích",
    textEng: "Excited",
  },
  {
    id: 4,
    code: "tired",
    icon: require("../assets/icon/icon5.png"),
    textVi: "Mệt mỏi",
    textEng: "Tired",
  },
];

// For backward compatibility
export const MOOD_ICONS = MOODS.map((mood) => mood.icon);

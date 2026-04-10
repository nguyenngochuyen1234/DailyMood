import { Compass, Languages } from "lucide-react-native";
import React from "react";
import { COLORS } from "./colors";
import { Zap } from "lucide-react-native/icons";
import { Dumbbell } from "lucide-react-native";

export const JOURNEYS = [
  {
    id: "0",
    title: "Không chọn",
    icon: React.createElement(Compass as any, {
      size: 20,
      color: COLORS.text.muted,
    }),
    bgColor: COLORS.background.soft,
  },
  {
    id: "1",
    title: "Hành trình học Tiếng Trung",
    icon: React.createElement(Languages as any, {
      size: 20,
      color: COLORS.text.dark,
    }),
    bgColor: "#fdf4db",
  },
  {
    id: "2",
    title: "Hành trình Giảm cân",
    icon: React.createElement(Zap as any, {
      size: 20,
      color: COLORS.text.dark,
    }),
    bgColor: "#e2f3df",
  },
  {
    id: "3",
    title: "Hành trình học Thế dục",
    icon: React.createElement(Dumbbell as any, {
      size: 20,
      color: COLORS.text.dark,
    }),
    bgColor: "#fdf4db",
  },
];

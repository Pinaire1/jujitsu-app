export const BELT_COLORS = {
  WHITE: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    name: "White",
  },
  BLUE: {
    bg: "bg-blue-500",
    text: "text-blue-800",
    border: "border-blue-600",
    name: "Blue",
  },
  PURPLE: {
    bg: "bg-purple-500",
    text: "text-purple-800",
    border: "border-purple-600",
    name: "Purple",
  },
  BROWN: {
    bg: "bg-amber-700",
    text: "text-amber-900",
    border: "border-amber-800",
    name: "Brown",
  },
  BLACK: {
    bg: "bg-gray-900",
    text: "text-gray-100",
    border: "border-gray-800",
    name: "Black",
  },
};

export type BeltLevel = keyof typeof BELT_COLORS;

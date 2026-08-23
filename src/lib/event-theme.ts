import type { CSSProperties } from "react";

export type EventTheme = "lavender" | "rose" | "ocean" | "midnight" | "ink" | "porcelain" | "citrus" | "terracotta";

type ThemeTokens = Record<string, string>;

const themes: Record<string, ThemeTokens> = {
  lavender: {
    background: "#f8f7ff",
    foreground: "#292340",
    card: "#ffffff",
    "card-foreground": "#292340",
    popover: "#ffffff",
    "popover-foreground": "#292340",
    primary: "#6d4aff",
    "primary-foreground": "#ffffff",
    secondary: "#efeaff",
    "secondary-foreground": "#4d32bd",
    muted: "#f2effa",
    "muted-foreground": "#706a81",
    accent: "#d8f5ec",
    "accent-foreground": "#176a52",
    border: "#e5e0f0",
    input: "#ded9ea",
    ring: "#6d4aff",
    mural: "#211b42",
    "mural-foreground": "#ffffff",
  },
  rose: {
    background: "#fff8fa",
    foreground: "#452532",
    card: "#ffffff",
    "card-foreground": "#452532",
    popover: "#ffffff",
    "popover-foreground": "#452532",
    primary: "#d95083",
    "primary-foreground": "#ffffff",
    secondary: "#fff0f5",
    "secondary-foreground": "#a52f5d",
    muted: "#f9edf1",
    "muted-foreground": "#80616d",
    accent: "#ffe2c9",
    "accent-foreground": "#925426",
    border: "#f0dfe5",
    input: "#ead8df",
    ring: "#d95083",
    mural: "#3f172b",
    "mural-foreground": "#ffffff",
  },
  ocean: {
    background: "#f5fbff",
    foreground: "#153041",
    card: "#ffffff",
    "card-foreground": "#153041",
    popover: "#ffffff",
    "popover-foreground": "#153041",
    primary: "#1778b5",
    "primary-foreground": "#ffffff",
    secondary: "#e8f6ff",
    "secondary-foreground": "#105a8c",
    muted: "#edf5f9",
    "muted-foreground": "#597181",
    accent: "#cef4e5",
    "accent-foreground": "#176c58",
    border: "#dcecf4",
    input: "#d4e5ed",
    ring: "#1778b5",
    mural: "#08283a",
    "mural-foreground": "#ffffff",
  },
  midnight: {
    background: "#171521",
    foreground: "#f7f5ff",
    card: "#211e30",
    "card-foreground": "#f7f5ff",
    popover: "#211e30",
    "popover-foreground": "#f7f5ff",
    primary: "#a58bff",
    "primary-foreground": "#171521",
    secondary: "#302b46",
    "secondary-foreground": "#e7e0ff",
    muted: "#29263a",
    "muted-foreground": "#b9b3ca",
    accent: "#4c3c64",
    "accent-foreground": "#f3dcff",
    border: "#39354d",
    input: "#3e3954",
    ring: "#a58bff",
    mural: "#0b0912",
    "mural-foreground": "#ffffff",
  },
  ink: { background: "#111111", foreground: "#fafafa", card: "#1c1c1c", "card-foreground": "#fafafa", popover: "#1c1c1c", "popover-foreground": "#fafafa", primary: "#ffffff", "primary-foreground": "#111111", secondary: "#292929", "secondary-foreground": "#f0f0f0", muted: "#242424", "muted-foreground": "#bdbdbd", accent: "#404040", "accent-foreground": "#ffffff", border: "#393939", input: "#343434", ring: "#ffffff", mural: "#050505", "mural-foreground": "#ffffff" },
  porcelain: { background: "#f8f8f6", foreground: "#171717", card: "#ffffff", "card-foreground": "#171717", popover: "#ffffff", "popover-foreground": "#171717", primary: "#171717", "primary-foreground": "#ffffff", secondary: "#ededeb", "secondary-foreground": "#292929", muted: "#f0f0ed", "muted-foreground": "#70706c", accent: "#deded8", "accent-foreground": "#1d1d1b", border: "#deded9", input: "#d4d4cf", ring: "#171717", mural: "#252525", "mural-foreground": "#ffffff" },
  citrus: { background: "#fffdf1", foreground: "#343216", card: "#ffffff", "card-foreground": "#343216", popover: "#ffffff", "popover-foreground": "#343216", primary: "#d67b00", "primary-foreground": "#ffffff", secondary: "#fff0c4", "secondary-foreground": "#8a4d00", muted: "#f7f0d8", "muted-foreground": "#756c4c", accent: "#d9f49b", "accent-foreground": "#42600a", border: "#eee0b5", input: "#e8dbad", ring: "#d67b00", mural: "#3d3514", "mural-foreground": "#ffffff" },
  terracotta: { background: "#fff8f3", foreground: "#4b2b22", card: "#ffffff", "card-foreground": "#4b2b22", popover: "#ffffff", "popover-foreground": "#4b2b22", primary: "#b95138", "primary-foreground": "#ffffff", secondary: "#fde5d9", "secondary-foreground": "#8e3927", muted: "#f7ece6", "muted-foreground": "#80645b", accent: "#dce9c4", "accent-foreground": "#496029", border: "#eed7cd", input: "#e7d0c6", ring: "#b95138", mural: "#42271f", "mural-foreground": "#ffffff" },
};

export const themeValues = (theme?: EventTheme) => themes[theme ?? "lavender"];

export const themeStyle = (theme?: EventTheme): CSSProperties => {
  const values = themeValues(theme);
  return Object.fromEntries(
    Object.entries(values).flatMap(([name, value]) => [
      [`--${name}`, value],
      [`--color-${name}`, value],
    ]),
  ) as CSSProperties;
};

export const themeOptions = Object.keys(themes);

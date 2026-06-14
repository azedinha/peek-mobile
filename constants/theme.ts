export const theme = {
  colors: {
    background: "#FFFFFF",
    primary: "#4C443B",
    primaryMuted: "rgba(76, 68, 59, 0.65)",
    text: "#4C443B",
    textSecondary: "rgba(76, 68, 59, 0.55)",
    border: "rgba(76, 68, 59, 0.12)",
    surface: "#FAFAF9",
    error: "#B42318",
    white: "#FFFFFF",
    cameraOverlay: "#000000",
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
  typography: {
    largeTitle: {
      fontSize: 34,
      fontWeight: "600" as const,
      letterSpacing: -0.5,
      color: "#4C443B",
    },
    title: {
      fontSize: 22,
      fontWeight: "600" as const,
      letterSpacing: -0.3,
      color: "#4C443B",
    },
    body: {
      fontSize: 17,
      fontWeight: "400" as const,
      lineHeight: 24,
      color: "#4C443B",
    },
    caption: {
      fontSize: 13,
      fontWeight: "400" as const,
      lineHeight: 18,
      color: "rgba(76, 68, 59, 0.55)",
    },
  },
} as const;

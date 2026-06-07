import type { Theme } from "@mui/joy";
import { extendTheme } from "@mui/joy";
import Values from "values.js";
import { useOrganization } from "../api/organization";
import React from "react";
import { APP_COLORS } from "../../shared/constants/colors";

const indexes = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

function generatePalette(
  color: string | undefined,
): Record<string, string> | undefined {
  if (!color) return undefined;

  const values = new Values(color);
  const colors = values.all(20);
  const palette = indexes.reduce<Record<string, string>>((acc, index, i) => {
    acc[index] = colors[i].hexString();
    return acc;
  }, {});

  return palette;
}

function buildTheme(primaryColor: string): Theme {
  return extendTheme({
    fontFamily: {
      display: "Open Sans Variable",
      body: "Inter Variable",
      fallback: "sans-serif",
    },
    colorSchemes: {
      light: {
        palette: {
          primary: generatePalette(primaryColor),
          neutral: generatePalette(APP_COLORS.neutral),
          success: generatePalette("#404040"),
          warning: generatePalette("#737373"),
          danger: generatePalette("#262626"),
          background: {
            body: APP_COLORS.backgroundBody,
            surface: APP_COLORS.backgroundSurface,
            level1: APP_COLORS.backgroundBody,
            popup: APP_COLORS.backgroundBody,
            tooltip: APP_COLORS.textPrimary,
          },
          text: {
            primary: APP_COLORS.textPrimary,
            secondary: APP_COLORS.textSecondary,
          },
          divider: APP_COLORS.border,
        },
      },
    },
  });
}

const themeCache = new Map<string, Theme>();

const loadingTheme = buildTheme(APP_COLORS.primary);

const noTheme = buildTheme(APP_COLORS.primary);

export const UserContext = React.createContext(null);

export const useTheme = () => {
  const organization = useOrganization();

  if (organization == undefined) return loadingTheme;

  const cacheKey =
    organization?.customPrimaryColor +
    organization?.name +
    organization?.domain +
    organization?.logoUrl +
    organization?.avatarUrl;

  if (themeCache.has(cacheKey)) {
    return themeCache.get(cacheKey);
  }

  const customPrimaryColor =
    organization?.customPrimaryColor ?? APP_COLORS.primary;

  const theme = buildTheme(customPrimaryColor);
  themeCache.set(cacheKey, theme);
  return theme;
};

export const usePrimaryColor = () => {
  const theme = useTheme();
  return theme?.palette.primary[500];
};

export const useSuccessColor = () => {
  const theme = useTheme();
  if (!theme) return "#404040";
  return theme.palette.success[500];
};

export const useWarningColor = () => {
  const theme = useTheme();
  if (!theme) return "#737373";
  return theme.palette.warning[500];
};

export const useDangerColor = () => {
  const theme = useTheme();
  if (!theme) return "#262626";
  return theme?.palette.danger[500];
};

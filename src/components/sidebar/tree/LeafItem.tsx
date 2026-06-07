import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Typography,
} from "@mui/joy";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "../../../lib/i18n";
import { useTheme } from "../../../lib/hooks/useTheme";

export function LeafItem({
  isSelected,
  icon,
  onClick,
  name,
  isFolder = false,
  children,
  endDecorator,
  isEmpty,
  isDemo,
  testId,
  singleLine = false,
}: {
  isSelected: boolean;
  name: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isFolder?: boolean;
  children?: React.ReactNode;
  endDecorator?: React.ReactNode;
  isEmpty?: boolean;
  isDemo?: boolean;
  testId?: string;
  singleLine?: boolean;
}) {
  const { t } = useTranslation();

  const [folderOpen, setFolderOpen] = useState(true);

  const onClickAction = isFolder
    ? () => setFolderOpen(!folderOpen)
    : () => onClick?.();

  const theme = useTheme();
  const selectedChatBackgroundColor =
    theme?.palette.neutral[100] ?? "#ececf1";
  const selectedChatTextColor = theme?.palette.text?.primary ?? "#0d0d0d";
  const colorStyles = {
    color: isSelected ? `${selectedChatTextColor} !important` : undefined,
    backgroundColor: isSelected
      ? `${selectedChatBackgroundColor} !important`
      : undefined,
  };
  return (
    <div id={isDemo ? "demoWorkflow" : undefined} data-testid={testId}>
      <ListItem nested={isFolder} sx={{ py: 0, px: 0.9, minHeight: 0 }}>
        <ListItemButton
          onClick={onClickAction}
          className="group"
          sx={{
            ...colorStyles,
            py: 0.4,
            width: "100%",
            fontSize: "14px",
            minHeight: 0,
            height: "fit-content",
            borderRadius: "md",
            "&:hover": colorStyles,
          }}
        >
          {isFolder &&
            (folderOpen ? (
              <KeyboardArrowDown fontSize="small" />
            ) : (
              <KeyboardArrowRight fontSize="small" />
            ))}
          {icon}
          <ListItemContent
            className={twMerge("ml-[0.3rem]", singleLine && "!line-clamp-1")}
          >
            {name}
          </ListItemContent>
          <div className="opacity-0 group-hover:opacity-100">
            {endDecorator}
          </div>
        </ListItemButton>
        {isFolder && folderOpen && (
          <List size="sm">
            {children}
            {isEmpty && (
              <Typography level="body-sm" color="neutral">
                {t("empty")}
              </Typography>
            )}
          </List>
        )}
      </ListItem>
    </div>
  );
}

import {
  IconButton,
  Stack,
  Typography,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import { useTranslation } from "react-i18next";
import { ArrowBack, ArrowForward, Check } from "@mui/icons-material";
import { useArtifact } from "./ArtifactProvider";
import { useState } from "react";
import { Dropdown } from "@mui/joy";

export default function VersionControl() {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const { artifact, versionIndex, showArtifact } = useArtifact();
  const { t } = useTranslation();

  if (!artifact?.versions) return;

  const effectiveVersionIndex =
    versionIndex === -1 ? artifact.versions.length - 1 : versionIndex;

  return (
    <div className="flex items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
      <Stack direction="row" spacing={1.5} alignItems="center">
        <IconButton
          disabled={effectiveVersionIndex === 0}
          onClick={() => {
            setDropdownVisible(false);
            showArtifact(artifact.versions[effectiveVersionIndex - 1].id);
          }}
        >
          <ArrowBack />
        </IconButton>

        <Dropdown open={dropdownVisible}>
          <MenuButton
            component={IconButton}
            sx={{ px: 2, border: 0 }}
            onClick={() => setDropdownVisible((prev) => !prev)}
          >
            <Typography fontWeight="600">
              {t("artifact.versionOutOf", {
                version: effectiveVersionIndex + 1,
                total: artifact.versions.length,
              })}
            </Typography>
          </MenuButton>

          <Menu
            sx={{
              maxHeight: 300,
              minWidth: 150,
              overflow: "auto",
            }}
          >
            {artifact.versions.map((version, i) => (
              <VersionTile
                key={version.id}
                text={t("artifact.version", { version: i + 1 })}
                active={effectiveVersionIndex === i}
                onClick={() => {
                  showArtifact(version.id);
                  setDropdownVisible(false);
                }}
              />
            ))}
          </Menu>
        </Dropdown>

        <IconButton
          disabled={effectiveVersionIndex === artifact.versions.length - 1}
          onClick={() => {
            setDropdownVisible(false);
            showArtifact(artifact.versions[effectiveVersionIndex + 1].id);
          }}
        >
          <ArrowForward />
        </IconButton>
      </Stack>
    </div>
  );
}

interface VersionTileProps {
  text: string;
  active: boolean;
  onClick: () => void;
}

function VersionTile({ text, active, onClick }: VersionTileProps) {
  return (
    <MenuItem
      onClick={onClick}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography
        fontWeight={active ? "bold" : "normal"}
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {text}
      </Typography>
      {active && <Check sx={{ fontSize: 20 }} />}
    </MenuItem>
  );
}

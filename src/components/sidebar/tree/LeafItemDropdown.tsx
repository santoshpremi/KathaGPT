import {
  DeleteForever,
  Edit,
  MoreVert,
  Star,
  StarBorder,
} from "@mui/icons-material";
import {
  Dropdown,
  IconButton,
  ListDivider,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";

import { useTranslation } from "../../../lib/i18n";

interface LeafItemDropdownProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function LeafItemDropdown({
  onEdit,
  onDelete,
  onToggleFavorite,
  isFavorite,
}: LeafItemDropdownProps) {
  const { t } = useTranslation();

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        size="sm"
        color="neutral"
        sx={{
          minHeight: 0,
          minWidth: 0,
          p: 0,
          width: "fit-content",
          height: "100%",
        }}
      >
        <MoreVert
          sx={{
            fontSize: "1.3rem",
          }}
        />
      </MenuButton>
      <Menu size="sm" placement="bottom-start">
        <MenuItem disabled={!onEdit} onClick={onEdit}>
          <ListItemDecorator>
            <Edit />
          </ListItemDecorator>
          {t("edit")}
        </MenuItem>
        {onToggleFavorite && (
          <MenuItem onClick={onToggleFavorite}>
            <ListItemDecorator>
              {isFavorite ? <Star /> : <StarBorder />}
            </ListItemDecorator>
            {isFavorite ? t("removeFromFavorites") : t("markAsFavorite")}
          </MenuItem>
        )}
        <ListDivider />
        <MenuItem color="danger" disabled={!onDelete} onClick={onDelete}>
          <ListItemDecorator sx={{ color: "inherit" }}>
            <DeleteForever />
          </ListItemDecorator>
          {t("delete")}
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}

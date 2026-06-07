import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  ModalDialog,
} from "@mui/joy";
import RouteModal from "../../../components/util/RouteModal";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../lib/api/user";
import { Stack } from "@mui/system";
import { useState } from "react";
import { useOrganizationApi } from "../../../lib/hooks/useApi";
import { toast } from "react-toastify";
import { useModals } from "../../../router";
import { mutate } from "swr";

// TODO move to (modals) folder

export default function ProfileSettingsModal() {
  const { t } = useTranslation();
  const user = useUser("me");
  const api = useOrganizationApi();
  const modals = useModals();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const disabled =
    (firstName === user?.firstName && lastName === user?.lastName) ||
    firstName === "" ||
    lastName === "";

  const onSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("submitting");
    setLoading(true);
    try {
      await api.patch("users/me", {
        firstName,
        lastName,
      });
      toast.success(t("dataSaved"));
      modals.close();
      await mutate("/users/me");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <RouteModal>
      <ModalDialog variant="soft" sx={{ width: "350px" }}>
        <div className="flex w-full justify-center gap-4">
          <Avatar
            src={user?.imageUrl ?? ""}
            sx={{ height: "100px", width: "100px" }}
          />
        </div>
        <form onSubmit={onSubmit}>
          <Stack spacing={2} pb={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input disabled value={user?.primaryEmail ?? t("unknown")} />
            </FormControl>
            <FormControl>
              <FormLabel>{t("firstName")}</FormLabel>
              <Input
                value={firstName ?? t("unknown")}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("lastName")}</FormLabel>
              <Input
                value={lastName ?? t("unknown")}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
              />
            </FormControl>
          </Stack>
          <Button
            variant="solid"
            color="primary"
            disabled={disabled}
            loading={loading}
            fullWidth
            type="submit"
          >
            {t("save")}
          </Button>
        </form>
      </ModalDialog>
    </RouteModal>
  );
}

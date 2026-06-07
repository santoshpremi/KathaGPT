import { useEffect } from "react";
import { useNavigate } from "../router";
import { DEV_ORG_ID } from "../lib/local/seed";

export default function WorkflowsRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    void navigate("/:organizationId/workflows", {
      params: { organizationId: DEV_ORG_ID },
      replace: true,
    });
  }, [navigate]);

  return null;
}

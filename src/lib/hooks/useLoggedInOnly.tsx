import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../context/authStore";
import { useParams } from "../../router";

export function useLoggedInOnly() {
  const loggedIn = useAuthStore((store) => store.loggedIn);
  const navigate = useNavigate();
  const loc = useLocation();
  const params = useParams("/:organizationId");

  useEffect(() => {
    if (!loggedIn && params.organizationId) {
      console.log("Redirecting to auth");
      localStorage.setItem("returnUrl", loc.pathname + loc.search);
      navigate({
        pathname: `/${params.organizationId}/auth`,
      });
    }
  }, [loggedIn, navigate, loc.pathname, loc.search, params.organizationId]);
}

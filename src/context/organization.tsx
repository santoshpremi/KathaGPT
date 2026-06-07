// src/context/organization.tsx
import { createContext, useContext, useEffect } from "react";
import { useParams } from "../router";
import { ApiOrganization } from "../../packages/apiTypes/src/Organization";
import { useOrganizationQuery } from "../lib/api/localHooks";

type OrganizationContextType = {
  organization: ApiOrganization | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

const OrganizationContext = createContext<OrganizationContextType>({
  organization: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizationId } = useParams("/:organizationId");

  const { data, isLoading, error, refetch } = useOrganizationQuery();

  // Validate organization data against Zod schema
  const validatedOrg = data ? ApiOrganization.safeParse(data) : null;

  const value: OrganizationContextType = {
    organization: validatedOrg?.success ? validatedOrg.data : null,
    loading: isLoading,
    error: error 
      ? new Error(error.message) 
      : (validatedOrg?.success === false 
        ? new Error(validatedOrg.error.message) 
        : null),
    refetch,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}

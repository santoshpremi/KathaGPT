import axios from "axios";
import _ from "lodash";
import { useMemo, useRef } from "react";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import type z from "zod";
import { useParams } from "../../router";
import { useAuthStore } from "../context/authStore";
import { handleAxiosError } from "../errorHandling";
import { useTranslation } from "../i18n";

type UseApiOptions = Partial<{ disableErrorToast: boolean }>;

export function useRootApi(options?: UseApiOptions) {
  return useApiWithBasePath(`/api`, options);
}

export function useOrganizationApi(options?: UseApiOptions) {
  const params = useParams("/:organizationId");
  const organizationId =
    params?.organizationId || import.meta.env.VITE_DEFAULT_ORG_ID;

  if (!organizationId && import.meta.env.PROD) {
    throw new Error("Organization ID is required in production");
  }

  return useApiWithBasePath(
    `/api/organizations/${organizationId || "default_org"}`,
    options,
  );
}


// Update useOrganizationApi

export function useApiWithBasePath(basePath: string, options?: UseApiOptions) {
  const { t } = useTranslation();
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);

  return useMemo(() => {
    const api = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL ?? ""}${basePath}`,
      withCredentials: true,
      validateStatus: (status) => status < 400,
    });

// In useApiWithBasePath interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Return default user structure
      return Promise.resolve({
        data: {
          id: 'temp-user',
          firstName: 'Guest',
          roles: ['USER'],
          tourCompleted: false,
          // Add other required fields with defaults
        }
      });
    }
    handleAxiosError(error, setLoggedIn, t, options?.disableErrorToast);
    return Promise.reject(error);
  },
);

    return api;
  }, [basePath, options?.disableErrorToast, setLoggedIn, t]);
}

type useApiSWROptions = Partial<SWRConfiguration>;

// Modify useOrganizationSchemaResource
export function useOrganizationSchemaResource<T extends z.ZodSchema>(
  path: string,
  schema: T,
  options?: useApiSWROptions,
): z.infer<T> | undefined {
  const { data, error } = useOrganizationSWR(path, options);
  const lastParsed = useRef<null | z.infer<T>>(null);

  if (error) return undefined;
  if (!data) return undefined;

  try {
    const parsed = schema.parse(data);
    lastParsed.current = parsed;
    return parsed;
  } catch (error) {
    console.error("Zod validation failed:", error);
    return lastParsed.current ?? undefined; // Return last valid data
  }
}

export function useOrganizationResource<T = any>(
  path: string | null,
  options?: Partial<SWRConfiguration & { auth: boolean }>
): T | null | undefined {
  const swr = useOrganizationSWR(path, options);

  if (swr.error) {
    console.error("API Error:", swr.error);
    return null;
  }
  
  if (typeof swr.data === 'string') {
    console.error("Unexpected string response from API");
    return null;
  }

  return swr.data;
}

export function useRootSchemaResource<T extends z.ZodSchema>(
  path: string,
  schema: T,
  options?: useApiSWROptions,
): z.infer<T> | undefined {
  const data = useRootResource(path, options);
  const lastParsed = useRef<null | z.infer<T>>(null);

  if (data === undefined) return undefined;

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.error("Schema validation failed:", parsed.error);
    return lastParsed.current ?? undefined;
  }

  if (!_.isEqual(parsed.data, lastParsed.current)) {
    lastParsed.current = parsed.data;
  }

  return lastParsed.current;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRootResource<T = any>(
  path: string,
  options?: Partial<SWRConfiguration & { auth: boolean }>,
): T | null | undefined {
  const swr = useRootSWR(path, options);

  if (swr.isLoading) return undefined;
  if (swr.error) return undefined;
  if (!swr.data) return null;

  return swr.data;
}

// Update useOrganizationSWR
export function useOrganizationSWR(
  path: string | null,
  options?: useApiSWROptions
) {
  const params = useParams("/:organizationId");
  const organizationId = params?.organizationId;
  const fetcher = useOrganizationFetcher(); // Valid hook call

  return useSWR(
    organizationId && path ? `${path}?org=${organizationId}` : null,
    fetcher,
    {
      ...options,
      enabled: !!organizationId && !!path,
    }
  );
}

export function useRootSWR(path: string, options?: useApiSWROptions) {
  return useSWR(path, useRootFetcher(), {
    ...options,
  });
}

function useFetcherFromApi(api: ReturnType<typeof useOrganizationApi>) {
  return async (url: string) => {
    return await api.get(url).then((res) => res?.data ?? null);
  };
}

export function useOrganizationFetcher() {
  const api = useOrganizationApi();
  return async (url: string) => {
    const path = url.split("?")[0];
    const response = await api.get(path);
    return response.data;
  };
}


export function useRootFetcher() {
  return useFetcherFromApi(useRootApi());
}

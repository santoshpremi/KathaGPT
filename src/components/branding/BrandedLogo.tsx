import type { ComponentProps } from "react";
import logoExtended from "../../assets/logo_extended.svg";
import logoMark from "../../assets/logo.svg";
import { KathGPTBrand } from "./KathGPTBrand";
import { useOrganization } from "../../lib/api/organization";
import { DelayedLoader } from "../util/DelayedLoader";

export function kathgptLogo({ ...props }: ComponentProps<"img">) {
  return (
    <img
      src={logoMark}
      alt="KathGPT Logo"
      {...props}
      style={{
        objectFit: "contain",
        ...props.style,
      }}
    />
  );
}

export function BrandedLogo({
  variant = "header",
  ...props
}: ComponentProps<"img"> & {
  variant?: "header" | "avatar";
}) {
  const organization = useOrganization();

  if (!organization) return <DelayedLoader />;

  const customBrandedSource: string | null = // the is the best case image
    variant == "header" ? organization?.logoUrl : organization?.avatarUrl;

  const customBrandedFallback = // if the best case image is not available, use the other one as fallback
    customBrandedSource ?? organization?.logoUrl ?? organization?.avatarUrl;

  if (!customBrandedFallback) {
    return (
      <KathGPTBrand
        compact={variant === "avatar"}
        style={props.style}
        className={props.className}
      />
    );
  }

  const defaultLogo = variant === "header" ? logoExtended : logoMark;
  const source = customBrandedFallback || defaultLogo;

  return (
    <img
      alt="KathGPT Logo"
      {...props}
      src={source}
      style={{
        objectFit: "contain",
        ...props.style,
      }}
    />
  );
}

export function CustomLogoWithFallback(
  props: ComponentProps<"img"> & {
    customSource: string | null;
  },
) {
  const source = props.customSource || logoExtended;

  return (
    <img
      alt="KathGPT Logo"
      src={source}
      {...props}
      style={{
        objectFit: "contain",
        ...props.style,
      }}
    />
  );
}

export function DefaultLogo(props: ComponentProps<"img">) {
  return (
    <img
      src={logoMark}
      alt="KathGPT Logo"
      {...props}
      style={{
        objectFit: "contain",
        ...props.style,
      }}
    />
  );
}

export { logoExtended, logoMark };

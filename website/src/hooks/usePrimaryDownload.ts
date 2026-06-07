import { useEffect, useState } from "react";
import {
  detectPlatform,
  fetchLatestRelease,
  getReleasesUrl,
  matchAsset,
  PLATFORMS,
  type GitHubRelease,
  type PlatformId,
} from "../lib/site";

export function usePrimaryDownload() {
  const [platform] = useState<PlatformId>(() => detectPlatform());
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);

  const platformMeta = PLATFORMS.find((p) => p.id === platform)!;
  const asset = release ? matchAsset(release.assets, platform) : null;
  const releasesUrl = getReleasesUrl();
  const latestReleasePage = `${releasesUrl}/latest`;

  useEffect(() => {
    let cancelled = false;
    void fetchLatestRelease().then((data) => {
      if (!cancelled) {
        setRelease(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    platform,
    platformMeta,
    release,
    asset,
    /** Direct file download when a release asset exists. */
    downloadUrl: asset?.browser_download_url ?? latestReleasePage,
    /** True when the button starts an immediate file download. */
    isDirectDownload: Boolean(asset),
    releasesUrl,
    latestReleasePage,
    fileName: asset?.name,
    fileSize: asset?.size,
  };
}

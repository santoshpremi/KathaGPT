import { useEffect, useState } from "react";
import {
  assetUrl,
  detectPlatform,
  fetchDownloadManifest,
  fetchLatestRelease,
  hostedDownloadUrl,
  matchAsset,
  PLATFORMS,
  type DownloadManifest,
  type GitHubRelease,
  type PlatformId,
} from "../lib/site";

export function usePrimaryDownload() {
  const [platform] = useState<PlatformId>(() => detectPlatform());
  const [manifest, setManifest] = useState<DownloadManifest | null>(null);
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);

  const platformMeta = PLATFORMS.find((p) => p.id === platform)!;
  const hostedFile = manifest?.platforms[platform] ?? null;
  const releaseAsset = release ? matchAsset(release.assets, platform) : null;

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchDownloadManifest(), fetchLatestRelease()]).then(
      ([manifestData, releaseData]) => {
        if (!cancelled) {
          setManifest(manifestData);
          setRelease(releaseData);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const downloadUrl = hostedFile
    ? hostedDownloadUrl(hostedFile)
    : releaseAsset?.browser_download_url ?? null;

  const fileName = hostedFile ?? releaseAsset?.name;
  const fileSize = releaseAsset?.size;

  return {
    loading,
    platform,
    platformMeta,
    manifest,
    release,
    downloadUrl,
    isReady: Boolean(downloadUrl),
    fileName,
    fileSize,
    manifestUrl: assetUrl("downloads/manifest.json"),
  };
}

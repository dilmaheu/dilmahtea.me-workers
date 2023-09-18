declare interface PlatformSpecificError extends Error {
  platform: string;
}

export default function rethrow(
  error: PlatformSpecificError,
  platform: string,
) {
  error.platform = platform;

  throw error;
}

export function resolveFormLeaveHref(input: {
  publicOwnerId: string;
  fromQuery: string | null;
  referer: string | null;
  publishedSharePath: string | null;
  appUrl: string;
}) {
  const fromPath = toSafeLeavePath(
    input.fromQuery,
    input.appUrl,
    input.publicOwnerId,
  );

  if (fromPath) {
    return fromPath;
  }

  const refererPath = toSafeLeavePath(
    input.referer,
    input.appUrl,
    input.publicOwnerId,
  );

  if (refererPath) {
    return refererPath;
  }

  if (input.publishedSharePath) {
    return input.publishedSharePath;
  }

  return "/";
}

function toSafeLeavePath(
  value: string | null,
  appUrl: string,
  publicOwnerId: string,
) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let pathname = "";
  let search = "";

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) {
      return null;
    }

    try {
      const parsed = new URL(
        trimmed,
        "https://intakeio.invalid",
      );

      pathname = parsed.pathname;
      search = parsed.search;
    } catch {
      return null;
    }
  } else {
    try {
      const parsed = new URL(trimmed);
      const app = new URL(appUrl);

      if (parsed.origin !== app.origin) {
        return null;
      }

      pathname = parsed.pathname;
      search = parsed.search;
    } catch {
      return null;
    }
  }

  const formPath =
    `/${publicOwnerId}/form`;

  if (
    pathname === formPath ||
    pathname.startsWith(`${formPath}/`)
  ) {
    return null;
  }

  return `${pathname}${search}`;
}

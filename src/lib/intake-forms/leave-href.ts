export function resolveFormLeaveHref(input: {
  publicOwnerId: string;
  fromQuery: string | null;
  referer: string | null;
  publishedSharePath: string | null;
  appUrl: string;
}) {
  const formPath =
    `/${input.publicOwnerId}/form`;

  const fromPath = toSafeSameOriginPath(
    input.fromQuery,
    input.appUrl,
    formPath,
  );

  if (fromPath) {
    return fromPath;
  }

  const refererTarget = toSafeLeaveTarget(
    input.referer,
    input.appUrl,
    formPath,
  );

  if (refererTarget) {
    return refererTarget;
  }

  if (
    input.publishedSharePath &&
    !isFormPath(
      input.publishedSharePath,
      formPath,
    )
  ) {
    return input.publishedSharePath;
  }

  return null;
}

export function resolveCloseDestination(input: {
  leaveHref: string | null;
  referrer: string;
  publicOwnerId: string;
  appOrigin: string;
}) {
  const formPath =
    `/${input.publicOwnerId}/form`;

  if (
    input.leaveHref &&
    isAllowedLeaveTarget(
      input.leaveHref,
      formPath,
      input.appOrigin,
    )
  ) {
    return input.leaveHref;
  }

  const referrerTarget = toSafeLeaveTarget(
    input.referrer,
    input.appOrigin,
    formPath,
  );

  if (referrerTarget) {
    return referrerTarget;
  }

  return null;
}

function isFormPath(
  pathname: string,
  formPath: string,
) {
  return (
    pathname === formPath ||
    pathname.startsWith(`${formPath}/`)
  );
}

function isAllowedLeaveTarget(
  value: string,
  formPath: string,
  appUrl: string,
) {
  return Boolean(
    toSafeLeaveTarget(
      value,
      appUrl,
      formPath,
    ),
  );
}

function toSafeSameOriginPath(
  value: string | null,
  appUrl: string,
  formPath: string,
) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    trimmed.startsWith("//")
  ) {
    return null;
  }

  if (!trimmed.startsWith("/")) {
    return null;
  }

  try {
    const parsed = new URL(
      trimmed,
      "https://intakeio.invalid",
    );

    if (isFormPath(parsed.pathname, formPath)) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function toSafeLeaveTarget(
  value: string | null,
  appUrl: string,
  formPath: string,
) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    return toSafeSameOriginPath(
      trimmed,
      appUrl,
      formPath,
    );
  }

  try {
    const parsed = new URL(trimmed);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return null;
    }

    if (isFormPath(parsed.pathname, formPath)) {
      return null;
    }

    const app = new URL(appUrl);

    if (parsed.origin === app.origin) {
      return `${parsed.pathname}${parsed.search}`;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

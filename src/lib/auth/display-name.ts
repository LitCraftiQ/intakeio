export function getMetadataString(
  metadata: Record<string, unknown>,
  key: string,
) {
  const value = metadata[key];

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getNameFromRecord(
  record: Record<string, unknown>,
) {
  const fullName =
    getMetadataString(
      record,
      "full_name",
    ) ||
    getMetadataString(record, "name");

  if (fullName) {
    return fullName;
  }

  return [
    getMetadataString(
      record,
      "given_name",
    ),
    getMetadataString(
      record,
      "family_name",
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function getStoredDisplayName(user: {
  user_metadata?: Record<
    string,
    unknown
  > | null;
  identities?: Array<{
    identity_data?: Record<
      string,
      unknown
    > | null;
  }> | null;
}) {
  const metadata =
    (user.user_metadata ??
      {}) as Record<string, unknown>;

  const fromMetadata = getNameFromRecord(
    metadata,
  );

  if (fromMetadata) {
    return fromMetadata;
  }

  for (const identity of user.identities ??
    []) {
    const identityData =
      (identity.identity_data ??
        {}) as Record<string, unknown>;

    const fromIdentity =
      getNameFromRecord(identityData);

    if (fromIdentity) {
      return fromIdentity;
    }
  }

  return "";
}

export function getUserDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<
    string,
    unknown
  > | null;
  identities?: Array<{
    identity_data?: Record<
      string,
      unknown
    > | null;
  }> | null;
}) {
  const storedName =
    getStoredDisplayName(user);

  if (storedName) {
    return storedName;
  }

  const emailLocalPart =
    user.email?.split("@")[0]?.trim() ??
    "";

  if (emailLocalPart) {
    return emailLocalPart;
  }

  return "Intakeio user";
}

export function hasLinkedAuthProviders(user: {
  app_metadata?: {
    providers?: string[];
  } | null;
  identities?: Array<{
    provider?: string;
  }> | null;
}) {
  const providers =
    user.app_metadata?.providers;

  if (
    Array.isArray(providers) &&
    providers.length > 1
  ) {
    return true;
  }

  return (user.identities ?? []).length > 1;
}

export function isReturningAuthAccount(user: {
  created_at: string;
  identities?: Array<{
    created_at?: string;
    provider?: string;
  }> | null;
}) {
  const identities = user.identities ?? [];

  if (identities.length > 1) {
    const createdTimes = identities
      .map((identity) =>
        identity.created_at
          ? new Date(
              identity.created_at,
            ).getTime()
          : Number.NaN,
      )
      .filter((value) =>
        Number.isFinite(value),
      );

    if (createdTimes.length > 1) {
      const oldest = Math.min(
        ...createdTimes,
      );
      const newest = Math.max(
        ...createdTimes,
      );

      if (newest - oldest > 15_000) {
        return true;
      }
    }
  }

  return false;
}

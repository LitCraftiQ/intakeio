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

function getIdentityName(
  identity: {
    provider?: string;
    identity_data?: Record<
      string,
      unknown
    > | null;
  },
) {
  return getNameFromRecord(
    (identity.identity_data ??
      {}) as Record<string, unknown>,
  );
}

export function getDisplayNameFromEmail(
  email?: string | null,
) {
  const localPart =
    email?.split("@")[0]?.trim() ?? "";

  if (!localPart) {
    return "";
  }

  const withoutAlias =
    localPart.split("+")[0] ?? localPart;

  const words = withoutAlias
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "";
  }

  return words
    .map((word) => {
      if (word.length === 1) {
        return word.toUpperCase();
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}

export function getStoredDisplayName(user: {
  user_metadata?: Record<
    string,
    unknown
  > | null;
  identities?: Array<{
    provider?: string;
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

  const identities = user.identities ?? [];

  for (const identity of identities) {
    if (identity.provider !== "google") {
      continue;
    }

    const fromGoogle =
      getIdentityName(identity);

    if (fromGoogle) {
      return fromGoogle;
    }
  }

  for (const identity of identities) {
    if (identity.provider === "google") {
      continue;
    }

    const fromIdentity =
      getIdentityName(identity);

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
    provider?: string;
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

  const fromEmail =
    getDisplayNameFromEmail(user.email);

  if (fromEmail) {
    return fromEmail;
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
  app_metadata?: {
    providers?: string[];
  } | null;
  identities?: Array<{
    created_at?: string;
    provider?: string;
  }> | null;
}) {
  return hasLinkedAuthProviders(user);
}

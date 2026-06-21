import type { User } from "@supabase/supabase-js";

const DEFAULT_FIRST_NAME = "Diego";

function readMetadataName(user: User | null): string | null {
  if (!user?.user_metadata) return null;

  const raw = user.user_metadata.full_name ?? user.user_metadata.name;
  if (typeof raw === "string" && raw.trim()) {
    return raw.trim();
  }

  return null;
}

export function getDisplayFirstName(user: User | null): string {
  const fullName = readMetadataName(user);
  if (fullName) {
    return fullName.split(/\s+/)[0];
  }

  if (user?.email) {
    const local = user.email.split("@")[0]?.trim();
    if (local) {
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
  }

  return DEFAULT_FIRST_NAME;
}

export function getDisplayFullName(user: User | null): string {
  const fullName = readMetadataName(user);
  if (fullName) {
    return fullName;
  }

  if (user?.email) {
    const local = user.email.split("@")[0]?.trim();
    if (local) {
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
  }

  return "Usuário Peek";
}

export function getUserAvatarUrl(user: User | null): string | null {
  if (!user?.user_metadata) return null;

  const raw =
    user.user_metadata.avatar_url ??
    user.user_metadata.picture ??
    user.user_metadata.avatar;

  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

export function getUserEmailLabel(user: User | null): string {
  return user?.email ?? "E-mail não disponível";
}

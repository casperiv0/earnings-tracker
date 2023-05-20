function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://earnings.caspertheghost.me";
  }

  if (typeof window !== "undefined") {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  return `${getBaseUrl()}/api/trpc`;
}

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("nl-BE", { dateStyle: "full" }).format(new Date(value));

export const formatTime = (value: string) =>
  new Intl.DateTimeFormat("nl-BE", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export const buildReferenceCode = () => `TR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const clientEnv = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  businessName: import.meta.env.VITE_BUSINESS_NAME ?? "Yaro's Barber",
  businessTimezone: import.meta.env.VITE_BUSINESS_TIMEZONE ?? 'America/Costa_Rica',
};

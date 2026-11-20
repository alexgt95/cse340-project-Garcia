const SERVICES_URL = "/data/services.json";

export async function fetchServices() {
  const response = await fetch(SERVICES_URL);
  if (!response.ok) {
    throw new Error(`Response not OK (${response.status})`);
  }
  return response.json();
}

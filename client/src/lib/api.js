export const API_BASE = "http://localhost:5000/api";

export async function fetcher(url, options = {}) {
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) throw new Error("API error");
    return res.json();
}

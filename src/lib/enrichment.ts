export async function enrichLinkedIn(linkedinUrl: string): Promise<Record<string, unknown>> {
  if (!linkedinUrl || !process.env.APIFY_API_KEY) return {};
  try {
    const res = await fetch("https://api.apify.com/v2/acts/anchor~linkedin-profile-scraper/run-sync-get-dataset-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIFY_API_KEY}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: linkedinUrl }],
        proxy: { useApifyProxy: true },
      }),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data?.[0] ?? {};
  } catch {
    return {};
  }
}

export async function fetchCompanyNews(company: string): Promise<string[]> {
  if (!company || !process.env.NEWSDATA_API_KEY) return [];
  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(company)}&language=en&size=3`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: { title: string }) => r.title);
  } catch {
    return [];
  }
}

export async function verifyEmail(email: string): Promise<{ valid: boolean; email: string }> {
  if (!email || !process.env.SKRAPP_API_KEY) return { valid: false, email };
  try {
    const res = await fetch(`https://api.skrapp.io/api/v2/verify?email=${encodeURIComponent(email)}`, {
      headers: { "X-Access-Key": process.env.SKRAPP_API_KEY },
    });
    if (!res.ok) return { valid: false, email };
    const data = await res.json();
    return { valid: data.status === "valid", email };
  } catch {
    return { valid: false, email };
  }
}

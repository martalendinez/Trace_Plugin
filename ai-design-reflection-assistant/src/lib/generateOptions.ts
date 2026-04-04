export async function generateOptions(payload: any) {
  const res = await fetch("http://localhost:3001/api/reflect/options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to generate options");

  return res.json();
}

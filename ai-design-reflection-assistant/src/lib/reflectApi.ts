export async function callReflectApi(payload: any) {
  const res = await fetch("http://localhost:3001/api/reflect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Reflect API failed");
  }

  return res.json();
}

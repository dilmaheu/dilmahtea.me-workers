/**
 * Use this function when making a GET request.
 * `T` is the generic for the response type.
 */
export async function getJson<T>(
  url: string,
  header: Headers
): Promise<T> {
  const res = await fetch(url, { headers: header });
  if (!res.ok) {
    console.error(res.status)
    throw new Error("Unexpected HTTP response!");
  }
  return await res.json();
}
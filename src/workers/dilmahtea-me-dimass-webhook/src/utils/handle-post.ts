export default async function (request: Request) {
  const data = await request.json();

  console.log(data);
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    statusText: "Something went right?",
  });
}

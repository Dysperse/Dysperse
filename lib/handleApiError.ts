export function handleApiError(e: any) {
  console.error(e)
  return Response.json(
    { error: e.message },
    {
      status: 500,
    }
  );
}

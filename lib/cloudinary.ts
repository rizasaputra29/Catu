export function getCloudinaryAvatarUrl(
  rawUrl: string | null | undefined,
  { width = 400, height = 400 } = {}
): string | undefined {
  if (!rawUrl) return undefined;

  return rawUrl.replace(
    '/image/upload/',
    `/image/upload/c_fill,w_${width},h_${height},g_face,f_auto,q_auto/`
  );
}

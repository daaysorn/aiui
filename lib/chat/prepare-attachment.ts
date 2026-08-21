/** Max edge length for chat image uploads (keeps Eve payloads small). */
const MAX_IMAGE_EDGE = 1280
const JPEG_QUALITY = 0.82

/**
 * Shrink large images before they become data URLs for Eve.
 * Non-images and tiny images pass through unchanged.
 */
export async function prepareChatAttachment(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file
  }

  // Skip tiny files — resize cost > savings.
  if (file.size < 350_000) {
    return file
  }

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  try {
    const scale = Math.min(
      1,
      MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height)
    )
    if (scale >= 1 && file.size < 1_500_000) {
      return file
    }

    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    })
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() })
  } finally {
    bitmap.close()
  }
}

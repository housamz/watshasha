export interface ContentItem {
  original_language?: string;
}

export function isArabicContent(item: ContentItem): boolean {
  if (!item || !item.original_language) {
    return false;
  }
  return item.original_language.toLowerCase() === "ar";
}

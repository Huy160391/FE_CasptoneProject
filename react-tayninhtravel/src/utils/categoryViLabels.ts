// Map category key (BE trả về) sang tiếng Việt
// Sử dụng cho UI: t('shop.categories.' + key) hoặc lấy trực tiếp từ object này
export const CATEGORY_VI_LABELS: Record<string, string> = {
    souvenir: 'Đồ lưu niệm',
    clothing: 'Quần áo',
    specialties: 'Đặc sản',
    jewelry: 'Trang sức',
    food: 'Thực phẩm',
    // Thêm các key khác nếu có
};

// Hàm lấy label tiếng Việt từ key, fallback về key nếu không có
export function getCategoryViLabel(key: string): string {
    return CATEGORY_VI_LABELS[key] || key;
}

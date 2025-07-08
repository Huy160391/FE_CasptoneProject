import axios from '../config/axios';
import { useCartStore, type CartItem } from '@/store/useCartStore';

// Cập nhật giỏ hàng: Gửi API thêm sản phẩm vào giỏ, truyền token qua header, body đúng chuẩn API mới
export const updateCart = async (data: any, token: string) => {
    const response = await axios.post(
        '/Product/AddtoCart',
        data,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Xóa toàn bộ sản phẩm trong giỏ hàng
export const deleteAllCartItems = async (cartId: string) => {
    const response = await axios.delete(`/cart/${cartId}/items`);
    return response.data;
};

// Checkout giỏ hàng, trả về orderId và URL thanh toán PayOS
export const checkoutCart = async (cartId: string) => {
    const response = await axios.post(`/cart/${cartId}/checkout`);
    return response.data; // { orderId, payosUrl }
};

// Lấy giỏ hàng hiện tại của người dùng
export const getCurrentCart = async (token: string) => {
    const response = await axios.get('/Product/Cart', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    // Map lại từng item về đúng format CartItem cho UI
    const items = (response.data.data || []).map((item: any) => ({
        id: item.productId,
        name: item.productName,
        image: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        type: 'product', // Nếu có loại khác thì sửa lại
    }));
    return { items };
};

// Hàm đồng bộ giỏ hàng Zustand với server khi người dùng đăng nhập
export const syncCartOnLogin = async (token: string) => {
    // 1. Lấy cart từ Zustand store
    let localCart: CartItem[] = [];
    try {
        if (useCartStore.getState) {
            localCart = useCartStore.getState().items || [];
        }
    } catch { }

    // 2. Lấy cart từ API
    let serverCart: any = null;
    try {
        serverCart = await getCurrentCart(token);
    } catch { }

    // 3. Gộp cart (ưu tiên số lượng lớn hơn cho từng sản phẩm, key là id)
    const merged: Record<string, CartItem> = {};
    if (Array.isArray(serverCart?.items)) {
        for (const item of serverCart.items) {
            const key = item.id;
            merged[key] = { ...item };
        }
    }
    for (const item of localCart) {
        const key = item.id;
        if (merged[key]) {
            merged[key].quantity = Math.max(merged[key].quantity, item.quantity);
        } else {
            merged[key] = { ...item };
        }
    }
    const mergedItems: CartItem[] = Object.values(merged);

    // 4. Nếu có thay đổi, cập nhật lên server
    if (mergedItems.length > 0) {
        await updateCart({ items: mergedItems }, token);
        if (useCartStore.setState) {
            useCartStore.setState({ items: mergedItems });
        }
    }

    // 5. Lấy lại cart mới nhất từ server (nếu muốn đồng bộ tuyệt đối)
    let syncedCart = null;
    try {
        syncedCart = await getCurrentCart(token);
        if (useCartStore.setState && Array.isArray(syncedCart?.items)) {
            useCartStore.setState({ items: syncedCart.items });
        }
    } catch { }

    // 6. Trả về cart đã đồng bộ
    return syncedCart;
};
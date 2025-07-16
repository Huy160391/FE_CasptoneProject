import axios from '../config/axios';
import { useCartStore, type CartItem } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

// Cập nhật giỏ hàng: Gửi API thêm sản phẩm vào giỏ, truyền token qua header, body đúng chuẩn API mới
export const updateCart = async (data: any, token: string) => {
    // Xoá toàn bộ cart trước khi thêm mới
    try {
        await removeCart(token);
    } catch { }

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


// Checkout giỏ hàng, trả về orderId và URL thanh toán PayOS
export const checkoutCart = async (
    voucherCode: string
) => {
    const token = useAuthStore.getState().token || '';
    // Lấy danh sách sản phẩm hiện tại từ store và map lại đúng format
    const items = (useCartStore.getState().items || []).map(item => ({
        cartItemId: item.cartItemId,
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        type: item.type || 'product',
    }));
    // Call updateCart với đúng format
    await updateCart({ items }, token);
    // Fetch latest cart from server to get real cartItemIds
    const latestCart = await getCurrentCart(token);
    const cartItemIds = (latestCart.items || [])
        .map((item: any) => item.cartItemId)
        .filter((id: string) => id && id !== '' && id !== null);
    const response = await axios.post(
        '/Product/checkout',
        {
            cartItemIds,
            voucherCode,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
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
        cartItemId: item.cartItemId || item.id, // lấy cartItemId từ API, fallback sang id nếu cần
        productId: item.productId,
        name: item.productName,
        image: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
        type: 'product', // luôn gán type là 'product'
        // ...other fields nếu cần
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

    // Nếu local cart rỗng, chỉ lấy cart từ server và cập nhật vào Zustand
    if (!localCart || localCart.length === 0) {
        try {
            const serverCart = await getCurrentCart(token);
            if (useCartStore.setState && Array.isArray(serverCart?.items)) {
                useCartStore.setState({ items: serverCart.items });
            }
            return serverCart;
        } catch {
            if (useCartStore.setState) {
                useCartStore.setState({ items: [] });
            }
            return { items: [] };
        }
    }

    // 2. Lấy cart từ API
    let serverCart: any = null;
    try {
        serverCart = await getCurrentCart(token);
    } catch { }

    // 3. Gộp cart (ưu tiên số lượng lớn hơn cho từng sản phẩm, key là productId)
    const merged: Record<string, CartItem> = {};
    if (Array.isArray(serverCart?.items)) {
        for (const item of serverCart.items) {
            const key = item.productId;
            merged[key] = { ...item };
        }
    }
    for (const item of localCart) {
        const key = item.productId;
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

// Xoá toàn bộ cart (xoá cart khỏi hệ thống)
export const removeCart = async (token: string) => {
    const response = await axios.delete('/Product/RemoveCart', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
import axios from '../config/axios';

import { useCartStore, type CartItem } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

// Cập nhật giỏ hàng: Gửi API thêm sản phẩm vào giỏ, truyền token qua header, body đúng chuẩn API mới
export const updateCart = async (data: any, token: string) => {
    // Xoá toàn bộ cart trước khi thêm mới
    try {
        await removeCart(token);
    } catch (error: any) {
        // Ignore 404 error khi cart không tồn tại
        if (error.response?.status !== 404) {
            console.warn('Error removing cart before update:', error);
        }
    }

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

// Sync cart lên server mà không xóa cart cũ trước (dùng cho logout)
export const syncCartToServer = async (data: any, token: string) => {
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
    myVoucherCodeId: string | null = null
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
            myVoucherCodeId: myVoucherCodeId || null,
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
    // Kiểm tra role của user trước khi đồng bộ cart
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            // Chỉ đồng bộ cart cho user role
            if (user.role !== 'user') {
                console.log('Skipping cart sync for non-user role:', user.role);
                // Clear cart cho các role khác
                if (useCartStore.setState) {
                    useCartStore.setState({ items: [] });
                }
                localStorage.removeItem('cart-storage');
                return { items: [] };
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

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

// Hàm đồng bộ cart khi logout - đảm bảo cart được lưu lên server
export const syncCartOnLogout = async (token: string) => {
    try {
        // Lấy cart hiện tại từ store
        const localItems = useCartStore.getState().items || [];

        if (localItems.length > 0) {
            // Nếu local cart có items, cần kiểm tra server cart trước
            try {
                const serverCart = await getCurrentCart(token);
                const serverItems = serverCart?.items || [];

                if (serverItems.length > 0) {
                    // Server cart có items, xóa trước rồi add mới
                    await updateCart({ items: localItems }, token);
                } else {
                    // Server cart rỗng, chỉ cần add thôi
                    await syncCartToServer({ items: localItems }, token);
                }
            } catch (error: any) {
                // Nếu getCurrentCart báo lỗi (cart không tồn tại), chỉ cần add
                await syncCartToServer({ items: localItems }, token);
            }
        } else {
            // Nếu local cart rỗng, xóa luôn server cart để đồng bộ
            try {
                await removeCart(token);
            } catch (error: any) {
                // Ignore 404 error khi server cart đã không tồn tại
                if (error.response?.status !== 404) {
                    console.warn('Error removing server cart:', error);
                }
            }
        }

        // Clear cart trong store
        if (useCartStore.setState) {
            useCartStore.setState({ items: [] });
        }

        // Clear cart storage
        localStorage.removeItem('cart-storage');

    } catch (error) {
        // Không throw error khi logout để không làm gián đoạn quá trình logout
        console.warn('Error syncing cart on logout:', error);
    }
};

// Xóa cart sau khi thanh toán thành công
export const clearCartAfterPayment = async () => {
    const token = useAuthStore.getState().token;

    if (token) {
        try {
            // Xóa cart trên server
            await removeCart(token);
        } catch (error: any) {
            // Ignore 404 error nếu cart đã không tồn tại
            if (error.response?.status !== 404) {
                console.warn('Error clearing server cart after payment:', error);
            }
        }
    }

    // Clear cart trong store
    if (useCartStore.setState) {
        useCartStore.setState({ items: [] });
    }

    // Clear cart storage
    localStorage.removeItem('cart-storage');
};

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_LABELS } from '@/config/constants';
import { CATEGORY_VI_LABELS } from '@/utils/categoryViLabels';
import type { Product } from '@/types';
import './CustomProductModal.scss';

// Define the enum for categories to match backend
export enum ProductCategory {
    Souvenir = 0,
    Clothing = 1,
    Specialties = 2,
    Jewelry = 3,
    Food = 4
}

// Map from string keys to enum values
export const CATEGORY_TO_ENUM: Record<string, ProductCategory> = {
    souvenir: ProductCategory.Souvenir,
    clothing: ProductCategory.Clothing,
    specialties: ProductCategory.Specialties,
    jewelry: ProductCategory.Jewelry,
    food: ProductCategory.Food
};

// Map from enum values to string keys
export const ENUM_TO_CATEGORY: Record<number, string> = {
    [ProductCategory.Souvenir]: 'souvenir',
    [ProductCategory.Clothing]: 'clothing',
    [ProductCategory.Specialties]: 'specialties',
    [ProductCategory.Jewelry]: 'jewelry',
    [ProductCategory.Food]: 'food'
};

interface ProductFormValues {
    name: string;
    description: string;
    price: number;
    quantityInStock: number;
    category: string;
    isSale: boolean;
    salePercent?: number;
    imageUrl: string[];
}

interface CustomProductModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: FormData | ProductFormValues) => Promise<void>;
    initialValues?: Product | null;
    title?: string;
}

const CustomProductModal = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    title = 'Thêm sản phẩm mới'
}: CustomProductModalProps) => {
    // State cho form
    const [formValues, setFormValues] = useState<Partial<ProductFormValues>>({
        name: '',
        description: '',
        price: 0,
        quantityInStock: 0,
        category: '',
        isSale: false,
        salePercent: 0,
        imageUrl: []
    });

    // State cho preview ảnh
    const [fileList, setFileList] = useState<{ file: File; preview: string; isExisting?: boolean; url?: string }[]>([]);

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Loading state
    const [submitting, setSubmitting] = useState(false);

    // Ref cho input file
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { i18n } = useTranslation();

    // Reset form khi modal mở/đóng hoặc khi initialValues thay đổi
    useEffect(() => {
        if (visible) {
            // Reset errors
            setErrors({});

            if (initialValues) {
                // Editing mode - fill form values
                // Convert category from backend (could be number or string) to string key
                let categoryKey = initialValues.category;

                // If category is a number (enum value), convert to string key
                if (!isNaN(Number(initialValues.category))) {
                    categoryKey = ENUM_TO_CATEGORY[Number(initialValues.category)] || 'souvenir';
                }

                // Tính giá gốc nếu có khuyến mãi
                let originalPrice = initialValues.price;
                if (initialValues.isSale && initialValues.salePercent && initialValues.salePercent > 0) {
                    originalPrice = Math.round(initialValues.price / (1 - initialValues.salePercent / 100));
                }
                setFormValues({
                    name: initialValues.name,
                    description: initialValues.description || '',
                    price: originalPrice,
                    quantityInStock: initialValues.quantityInStock,
                    category: categoryKey.toLowerCase(),
                    isSale: initialValues.isSale || false,
                    salePercent: initialValues.salePercent || 0,
                });

                // Chuyển đổi imageUrl thành fileList
                if (initialValues.imageUrl && initialValues.imageUrl.length > 0) {
                    const existingImages = initialValues.imageUrl.map((url, index) => ({
                        file: new File([], `image-${index}.jpg`),
                        preview: url,
                        isExisting: true,
                        url
                    }));
                    setFileList(existingImages);
                } else {
                    setFileList([]);
                }
            } else {
                // Thêm mới - reset form
                setFormValues({
                    name: '',
                    description: '',
                    price: 0,
                    quantityInStock: 0,
                    category: '',
                    isSale: false,
                    salePercent: 0,
                    imageUrl: []
                });
                setFileList([]);
            }
        }
    }, [visible, initialValues]);

    // Xử lý thay đổi input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Update form values
        setFormValues({
            ...formValues,
            [name]: value
        });

        // Clear error for this field
        if (errors[name]) {
            const updatedErrors = { ...errors };
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }

        // Special case for name field - validate immediately
        if (name === 'name' && value.trim() === '') {
            setErrors({
                ...errors,
                name: 'Vui lòng nhập tên sản phẩm!'
            });
        }
    };

    // Xử lý thay đổi switch
    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormValues({
            ...formValues,
            isSale: checked,
            // Reset salePercent if isSale is turned off
            ...(checked ? {} : { salePercent: 0 })
        });
    };

    // Xử lý upload ảnh
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check if adding these files would exceed the limit
        if (fileList.length + files.length > 8) {
            setErrors({
                ...errors,
                files: 'Tối đa 8 ảnh được phép tải lên'
            });
            return;
        }

        // Check file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const invalidTypeFiles = Array.from(files).filter(file => !allowedTypes.includes(file.type));
        if (invalidTypeFiles.length > 0) {
            setErrors({
                ...errors,
                files: 'Chỉ chấp nhận các định dạng JPG, PNG, JPEG'
            });
            return;
        }

        // Check file size (5MB limit)
        const invalidFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setErrors({
                ...errors,
                files: 'Ảnh phải có kích thước dưới 5MB'
            });
            return;
        }

        // Create previews for the files
        const newFiles = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        const updatedFileList = [...fileList, ...newFiles];
        setFileList(updatedFileList);
        console.log("Files added, updated file list:", updatedFileList);

        // Clear error if any
        if (errors.files) {
            const updatedErrors = { ...errors };
            delete updatedErrors.files;
            setErrors(updatedErrors);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Remove file from fileList
    const handleRemoveFile = (index: number) => {
        const newFileList = [...fileList];

        // If there's a preview URL, revoke it to free memory
        if (newFileList[index].preview && !newFileList[index].isExisting) {
            URL.revokeObjectURL(newFileList[index].preview);
        }

        newFileList.splice(index, 1);
        setFileList(newFileList);
        console.log("File removed, updated file list:", newFileList);

        // Add error if no files remain
        if (newFileList.length === 0) {
            setErrors({
                ...errors,
                files: 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm!'
            });
        }
    };

    // Click upload button
    const handleClickUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Validate form and return errors without updating state
    const validateFormAndGetErrors = () => {
        const newErrors: Record<string, string> = {};

        // Validate required fields
        if (!formValues.name || formValues.name.trim() === '') {
            newErrors.name = 'Vui lòng nhập tên sản phẩm!';
        }

        if (formValues.price === undefined || formValues.price < 0) {
            newErrors.price = 'Vui lòng nhập giá sản phẩm hợp lệ!';
        }

        if (formValues.quantityInStock === undefined || formValues.quantityInStock < 0) {
            newErrors.quantityInStock = 'Vui lòng nhập số lượng tồn kho hợp lệ!';
        }

        if (!formValues.category || formValues.category.trim() === '') {
            newErrors.category = 'Vui lòng chọn danh mục!';
        }

        // Validate images
        if (fileList.length === 0) {
            newErrors.files = 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm!';
        } else if (fileList.length > 8) {
            newErrors.files = 'Tối đa 8 ảnh được phép tải lên';
        }

        // Validate sale percent if sale is enabled
        if (formValues.isSale) {
            if (formValues.salePercent === undefined || formValues.salePercent < 1 || formValues.salePercent > 99) {
                newErrors.salePercent = 'Giảm giá phải từ 1% đến 99%!';
            }
        }

        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Thực hiện validate form và lấy kết quả ngay
        const validationErrors = validateFormAndGetErrors();

        // Kiểm tra xem có lỗi không
        if (Object.keys(validationErrors).length > 0) {
            // Cập nhật state errors
            setErrors(validationErrors);
            console.log("Validation failed:", validationErrors);
            return;
        }

        try {
            setSubmitting(true);
            console.log("Form is valid, submitting...");
            console.log("Form values:", formValues);
            console.log("File list:", fileList);

            // Tạo FormData để gửi dữ liệu bao gồm cả files
            const formData = new FormData();

            // Xác định file cần gửi lên
            const newFiles = fileList.filter(item => !item.isExisting).map(item => item.file);

            // Thêm các trường dữ liệu cơ bản theo thứ tự trong ảnh mà bạn cung cấp
            // Đảm bảo đúng case sensitivity của các trường
            // Name chắc chắn phải được thêm với đúng viết hoa
            const nameValue = formValues.name?.trim() || '';
            console.log("Name value before append:", nameValue);
            formData.append('Name', nameValue);

            formData.append('Description', formValues.description?.trim() || '');
            formData.append('Price', String(formValues.price || 0));
            formData.append('QuantityInStock', String(formValues.quantityInStock || 0));

            // Chuyển đổi category string thành giá trị enum (số)
            if (formValues.category) {
                // Nếu đã là số, dùng luôn, nếu là string thì chuyển sang enum
                let categoryEnum: number | undefined;
                if (!isNaN(Number(formValues.category))) {
                    categoryEnum = Number(formValues.category);
                } else {
                    categoryEnum = CATEGORY_TO_ENUM[formValues.category];
                }
                if (typeof categoryEnum === 'number' && !isNaN(categoryEnum)) {
                    formData.append('Category', String(categoryEnum));
                }
            }

            formData.append('IsSale', formValues.isSale ? 'true' : 'false');

            if (formValues.isSale && formValues.salePercent) {
                formData.append('SalePercent', String(formValues.salePercent));
            }

            // Thêm từng file mới vào FormData với tên trường là "Files" (F viết hoa)
            console.log("Adding files to FormData, count:", newFiles.length);
            newFiles.forEach((file, index) => {
                console.log(`Adding file ${index + 1}:`, file.name, file.size, file.type);
                formData.append('Files', file);
            });

            // Thêm log để kiểm tra các trường dữ liệu
            console.log("FormData prepared, checking keys:");
            const formDataEntries = Array.from(formData.entries());
            console.log("All FormData fields:", formDataEntries.map(entry => entry[0]));
            console.log("Name value:", formData.get('Name'));
            console.log("Files count:", formDataEntries.filter(entry => entry[0] === 'Files').length);

            // Nếu đang chỉnh sửa sản phẩm
            if (initialValues) {
                // Thêm ID sản phẩm vào FormData
                formData.append('Id', initialValues.id);

                // Xử lý ảnh khi chỉnh sửa sản phẩm
                const existingImages = fileList.filter(item => item.isExisting);

                if (existingImages.length > 0 && newFiles.length === 0) {
                    // Chỉ giữ lại ảnh cũ, không có ảnh mới
                    formData.append('KeepExistingImages', 'true');

                    // Thêm URL ảnh cũ vào FormData
                    existingImages.forEach(img => {
                        if (img.url) {
                            formData.append('ExistingImageUrls', img.url);
                        }
                    });
                } else if (newFiles.length === 0 && existingImages.length === 0) {
                    // Trường hợp đã xóa tất cả ảnh cũ và không thêm ảnh mới
                    setErrors({
                        files: 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm!'
                    });
                    setSubmitting(false);
                    return;
                }
                // Nếu có ảnh mới, chúng ta đã thêm vào FormData ở trên
            } else if (newFiles.length === 0) {
                // Thêm mới mà không có ảnh
                setErrors({
                    files: 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm!'
                });
                setSubmitting(false);
                return;
            }

            // Log FormData contents for debugging
            console.log("FormData prepared, keys:");

            // Log chi tiết từng trường trong FormData
            for (const pair of formData.entries()) {
                if (pair[0] === 'Files') {
                    const file = pair[1] as File;
                    console.log('Files:', file.name, `(${file.size} bytes)`, file.type);
                } else {
                    console.log(pair[0] + ':', pair[1]);
                }
            }

            // Log toàn bộ giá trị của Name để xác nhận
            console.log("Final Name value:", formData.get('Name'));

            // Đếm số lượng trường Files
            let filesCount = 0;
            for (const pair of formData.entries()) {
                if (pair[0] === 'Files') {
                    filesCount++;
                }
            }
            console.log("Total Files fields:", filesCount);

            // Kiểm tra header của request
            console.log("FormData will be sent with Content-Type: multipart/form-data");

            // Gọi API để tạo/cập nhật sản phẩm
            await onSubmit(formData);

            // Clean up object URLs
            fileList.forEach(item => {
                if (!item.isExisting && item.preview) {
                    URL.revokeObjectURL(item.preview);
                }
            });

            // Đóng modal sau khi hoàn thành
            onCancel();

        } catch (error: any) {
            console.error('Error submitting form:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    data: error.config?.data instanceof FormData ? 'FormData object' : error.config?.data
                }
            });

            // Hiển thị lỗi từ API nếu có
            if (error.response?.data?.errors) {
                const apiErrors = error.response.data.errors;
                const formattedErrors: Record<string, string> = {};

                // Chuyển đổi lỗi API thành định dạng lỗi form
                Object.keys(apiErrors).forEach(key => {
                    const errorKey = key.charAt(0).toLowerCase() + key.slice(1);
                    formattedErrors[errorKey === 'files' ? 'files' : errorKey] = apiErrors[key][0];
                });

                setErrors(formattedErrors);
            } else if (error.response?.data?.message) {
                // Lỗi chung từ API có dạng message
                setErrors({
                    general: error.response.data.message
                });
            } else {
                // Lỗi chung
                setErrors({
                    general: 'Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại!'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            fileList.forEach(item => {
                if (!item.isExisting && item.preview) {
                    URL.revokeObjectURL(item.preview);
                }
            });
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="custom-product-modal">
            <div className="modal-backdrop" onClick={onCancel}></div>
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                </div>
                <div className="modal-body">
                    <div className="custom-form">
                        {errors.general && (
                            <div className="form-group">
                                <div className="error-message general-error">{errors.general}</div>
                            </div>
                        )}
                        {/* Tên sản phẩm */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required-mark">*</span>
                                Tên sản phẩm
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? 'error' : ''}`}
                                name="name"
                                value={formValues.name || ''}
                                onChange={handleInputChange}
                                placeholder="Nhập tên sản phẩm"
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        {/* Mô tả */}
                        <div className="form-group">
                            <label className="form-label">Mô tả</label>
                            <textarea
                                className="form-control"
                                name="description"
                                value={formValues.description || ''}
                                onChange={handleInputChange}
                                placeholder="Mô tả sản phẩm"
                            ></textarea>
                        </div>

                        {/* Giá */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required-mark">*</span>
                                Giá (₫)
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.price ? 'error' : ''}`}
                                name="price"
                                value={formValues.price ? formValues.price.toLocaleString('vi-VN') : ''}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                    setFormValues({
                                        ...formValues,
                                        price: raw === '' ? 0 : parseInt(raw, 10)
                                    });
                                    if (errors.price) {
                                        setErrors({ ...errors, price: '' });
                                    }
                                }}
                            />
                            {errors.price && <div className="error-message">{errors.price}</div>}
                            <div style={{ marginTop: 6, fontSize: '13px', color: '#d4380d', fontWeight: 600, background: 'rgba(255, 229, 204, 0.7)', padding: '6px 12px', borderRadius: 6 }}>
                                * Hãy nhớ kiểm tra lại giá đã bao gồm thuế VAT chưa nhé. <br />
                                Chúng tôi và cơ quan thuế đều yêu cầu giá công khai của sản phẩm phải có VAT nếu thuộc diện chịu thuế.
                            </div>
                        </div>

                        {/* Số lượng tồn kho */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required-mark">*</span>
                                Số lượng tồn kho
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.quantityInStock ? 'error' : ''}`}
                                name="quantityInStock"
                                value={formValues.quantityInStock ? formValues.quantityInStock.toString() : ''}
                                onChange={e => {
                                    const raw = e.target.value.replace(/[^0-9]/g, '');
                                    let num = raw === '' ? 0 : parseInt(raw, 10);
                                    if (num > 10000) num = 10000;
                                    setFormValues({ ...formValues, quantityInStock: num });
                                    if (errors.quantityInStock) setErrors({ ...errors, quantityInStock: '' });
                                }}
                                maxLength={5}
                                placeholder="1-10.000"
                            />
                            {errors.quantityInStock && <div className="error-message">{errors.quantityInStock}</div>}
                        </div>

                        {/* Danh mục */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required-mark">*</span>
                                Danh mục
                            </label>
                            <select
                                className={`form-control ${errors.category ? 'error' : ''}`}
                                name="category"
                                value={formValues.category || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">Chọn danh mục</option>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <option key={key.toLowerCase()} value={key.toLowerCase()}>
                                        {i18n.language === 'vi'
                                            ? CATEGORY_VI_LABELS[key.toLowerCase()] || String(label)
                                            : String(label)}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <div className="error-message">{errors.category}</div>}
                        </div>

                        {/* Khuyến mãi */}
                        <div className="form-group">
                            <div className="toggle-container">
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={formValues.isSale || false}
                                        onChange={handleSwitchChange}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <span className="toggle-label">Khuyến mãi</span>
                            </div>
                        </div>

                        {/* Phần trăm giảm giá */}
                        {formValues.isSale && (
                            <div className="form-group">
                                <label className="form-label">
                                    <span className="required-mark">*</span>
                                    Phần trăm giảm giá (%)
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.salePercent ? 'error' : ''}`}
                                    name="salePercent"
                                    value={formValues.salePercent ? formValues.salePercent.toString() : ''}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/[^0-9]/g, '');
                                        let num = raw === '' ? 0 : parseInt(raw, 10);
                                        if (num > 99) num = 99;
                                        setFormValues({ ...formValues, salePercent: num });
                                        if (errors.salePercent) setErrors({ ...errors, salePercent: '' });
                                    }}
                                    maxLength={2}
                                    placeholder="1-99"
                                />
                                {errors.salePercent && <div className="error-message">{errors.salePercent}</div>}
                            </div>
                        )}

                        {/* Hình ảnh sản phẩm */}
                        <div className="form-group">
                            <label className="form-label">
                                <span className="required-mark">*</span>
                                Hình ảnh sản phẩm
                            </label>
                            <div className="file-upload-container">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/png,image/jpg"
                                    multiple
                                    style={{ display: 'none' }}
                                />
                                <div className="upload-area">
                                    {fileList.map((item, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={item.preview} alt={`preview ${index}`} />
                                            <div className="remove-image" onClick={() => handleRemoveFile(index)}>×</div>
                                        </div>
                                    ))}
                                    {fileList.length < 8 && (
                                        <div className="upload-box" onClick={handleClickUpload}>
                                            <div className="upload-icon">+</div>
                                            <div className="upload-text">Thêm ảnh</div>
                                        </div>
                                    )}
                                </div>
                                <div className="upload-note">
                                    Hỗ trợ JPG, PNG, JPEG. Kích thước tối đa: 5MB. Tối đa 8 ảnh.
                                    <br />Vui lòng tải lên ít nhất 1 ảnh sản phẩm!
                                </div>
                                {errors.files && <div className="error-message">{errors.files}</div>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-default" onClick={onCancel}>
                        Hủy
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang xử lý...' : (initialValues ? 'Cập nhật' : 'Thêm mới')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomProductModal;

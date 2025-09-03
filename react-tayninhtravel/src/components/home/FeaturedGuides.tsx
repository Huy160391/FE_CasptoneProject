import './FeaturedGuides.scss'

const FeaturedGuides = () => {
    const slogans = [
        { text: "Chuyên Nghiệp", color: "#52c41a" },   // xanh lá
        { text: "Tin Cậy", color: "#1890ff" },         // xanh dương
        { text: "Hướng Dẫn Viên Địa Phương", color: "#722ed1" }, // tím
        { text: "Tiết Kiệm", color: "#fa8c16" },       // cam
        { text: "Linh Hoạt", color: "#eb2f96" },       // hồng đậm
        { text: "An Toàn", color: "#f5222d" },         // đỏ
        { text: "Chất Lượng Cao", color: "#fadb14" },  // vàng
        { text: "Đa Ngôn Ngữ", color: "#13c2c2" }      // xanh ngọc
    ]

    const duplicated = [...slogans, ...slogans]

    // Hàm tính màu chữ dựa theo độ sáng nền
    const getTextColor = (bgColor: string) => {
        const hex = bgColor.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        return brightness > 150 ? '#000' : '#fff'
    }

    return (
        <section className="featured-guides">
            <div className="container">
                <div className="marquee">
                    <div className="marquee-track">
                        {duplicated.map((item, index) => (
                            <div
                                key={index}
                                className="marquee-item"
                                style={{
                                    background: item.color,
                                    color: getTextColor(item.color)
                                }}
                            >
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeaturedGuides

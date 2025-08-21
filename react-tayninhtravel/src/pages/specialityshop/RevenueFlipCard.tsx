import { Card, Statistic } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import "./RevenueFlipCard.scss";

interface RevenueFlipCardProps {
    beforeTax: number;
    afterTax: number;
}

const RevenueFlipCard: React.FC<RevenueFlipCardProps> = ({ beforeTax, afterTax }) => {
    return (
        <div className="revenue-flip-card">
            <div className="flip-card-inner">
                {/* Mặt trước */}
                <div className="flip-card-front">
                    <Card className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: "#faad14" }}>
                            <DollarOutlined />
                        </div>
                        <Statistic
                            title="Doanh thu trước thuế"
                            value={beforeTax ?? 0}
                            prefix="₫"
                            formatter={(v) => (typeof v === "number" ? v.toLocaleString() : v)}
                        />
                    </Card>
                </div>

                {/* Mặt sau */}
                <div className="flip-card-back">
                    <Card className="stat-card led-card">
                        <div className="stat-icon" style={{ backgroundColor: "#faad14" }}>
                            <DollarOutlined />
                        </div>
                        <Statistic
                            title="Doanh thu sau thuế"
                            value={afterTax ?? 0}
                            prefix="₫"
                            formatter={(v) => (typeof v === "number" ? v.toLocaleString() : v)}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RevenueFlipCard;

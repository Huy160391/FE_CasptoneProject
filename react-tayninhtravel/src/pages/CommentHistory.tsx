import { List, Rate } from 'antd';

interface CommentHistoryProps {
    data: Array<any>;
}

const CommentHistory = ({ data }: CommentHistoryProps) => {
    return (
        <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <List.Item.Meta
                        title={item.tourName}
                        description={
                            <>
                                <Rate disabled defaultValue={item.rating} />
                                <div>{item.comment}</div>
                                <div className="comment-date">{item.date}</div>
                            </>
                        }
                    />
                </List.Item>
            )}
        />
    );
};

export default CommentHistory;

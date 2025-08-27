import React from 'react';
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    TelegramShareButton,
    TelegramIcon,
    WhatsappShareButton,
    WhatsappIcon,
    EmailShareButton,
    EmailIcon,
} from 'react-share';
import { Modal } from 'antd';
import './SharePopup.scss';

interface SharePopupProps {
    visible: boolean;
    onClose: () => void;
    url: string;
}

const SharePopup: React.FC<SharePopupProps> = ({ visible, onClose, url }) => {
    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            title={null}
            className="share-popup-modal"
        >
            <div className="share-popup-buttons">
                <FacebookShareButton url={url}>
                    <FacebookIcon size={48} round />
                </FacebookShareButton>
                <TwitterShareButton url={url}>
                    <TwitterIcon size={48} round />
                </TwitterShareButton>
                <TelegramShareButton url={url}>
                    <TelegramIcon size={48} round />
                </TelegramShareButton>
                <WhatsappShareButton url={url}>
                    <WhatsappIcon size={48} round />
                </WhatsappShareButton>
                <EmailShareButton url={url}>
                    <EmailIcon size={48} round />
                </EmailShareButton>
            </div>
        </Modal>
    );
};

export default SharePopup;

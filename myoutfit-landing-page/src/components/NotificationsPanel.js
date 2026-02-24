import React from 'react';
import styles from '@/styles/Dashboard.module.scss';
import { FiX, FiPackage, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiBell } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { dashboardTranslations } from '@/translations/dashboardTranslations';

export default function NotificationsPanel({ isOpen, onClose, notifications, onMarkAsRead, onClearAll }) {
    const { language } = useLanguage();
    const t = dashboardTranslations[language] || dashboardTranslations.en;
    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'inventory_update':
                return <FiPackage />;
            case 'sync':
                return <FiRefreshCw />;
            case 'success':
                return <FiCheckCircle />;
            case 'warning':
                return <FiAlertCircle />;
            case 'analytics':
                return <FiTrendingUp />;
            default:
                return <FiBell />;
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case 'success':
                return styles.notifSuccess;
            case 'warning':
                return styles.notifWarning;
            case 'inventory_update':
                return styles.notifPrimary;
            default:
                return styles.notifInfo;
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return t.justNow;
        if (diff < 3600000) return t.minutesAgo.replace('{n}', Math.floor(diff / 60000));
        if (diff < 86400000) return t.hoursAgo.replace('{n}', Math.floor(diff / 3600000));
        return date.toLocaleDateString();
    };

    return (
        <>
            <div className={styles.notifOverlay} onClick={onClose}></div>
            <div className={styles.notificationsPanel}>
                <div className={styles.notifHeader}>
                    <h4>{t.notifications}</h4>
                    <div className={styles.notifHeaderActions}>
                        {notifications.length > 0 && (
                            <button onClick={onClearAll} className={styles.clearAllBtn}>
                                {t.clearAll}
                            </button>
                        )}
                        <button onClick={onClose} className={styles.notifCloseBtn}>
                            <FiX />
                        </button>
                    </div>
                </div>

                <div className={styles.notifList}>
                    {notifications.length === 0 ? (
                        <div className={styles.notifEmpty}>
                            <FiBell size={32} />
                            <p>{t.noNotifications}</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`${styles.notifItem} ${notif.read ? styles.notifRead : ''} ${getTypeClass(notif.type)}`}
                                onClick={() => onMarkAsRead(notif.id)}
                            >
                                <div className={styles.notifIcon}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className={styles.notifContent}>
                                    <div className={styles.notifTitle}>{notif.title}</div>
                                    <div className={styles.notifMessage}>{notif.message}</div>
                                    <div className={styles.notifTime}>{formatTime(notif.timestamp)}</div>
                                </div>
                                {!notif.read && <div className={styles.notifDot}></div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

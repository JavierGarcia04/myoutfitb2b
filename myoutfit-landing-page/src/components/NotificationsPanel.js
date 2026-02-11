import React from 'react';
import styles from '@/styles/Dashboard.module.scss';
import { FiX, FiPackage, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiBell } from 'react-icons/fi';

export default function NotificationsPanel({ isOpen, onClose, notifications, onMarkAsRead, onClearAll }) {
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

        if (diff < 60000) return 'Hace un momento';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`;
        return date.toLocaleDateString('es-ES');
    };

    return (
        <>
            <div className={styles.notifOverlay} onClick={onClose}></div>
            <div className={styles.notificationsPanel}>
                <div className={styles.notifHeader}>
                    <h4>Notificaciones</h4>
                    <div className={styles.notifHeaderActions}>
                        {notifications.length > 0 && (
                            <button onClick={onClearAll} className={styles.clearAllBtn}>
                                Limpiar todo
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
                            <p>No tienes notificaciones</p>
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

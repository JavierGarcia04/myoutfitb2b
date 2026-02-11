import React, { useState, useEffect } from 'react';
import styles from '@/styles/Dashboard.module.scss';
import { FiX, FiUser, FiMail, FiMapPin, FiBriefcase, FiSave } from 'react-icons/fi';

export default function UserConfigModal({ isOpen, onClose, user, store, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        storeName: '',
        language: 'es',
        notifications: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user && store) {
            setFormData({
                name: user.user_metadata?.full_name || '',
                email: user.email || '',
                storeName: store.name || '',
                language: user.user_metadata?.language || 'es',
                notifications: user.user_metadata?.notifications !== false
            });
        }
    }, [user, store, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving user config:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Configuración de Perfil</h3>
                    <button className={styles.closeButton} onClick={onClose} title="Cerrar">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className="mb-4 text-center">
                            <div className={styles.userAvatar} style={{ width: '80px', height: '80px', fontSize: '2rem', margin: '0 auto 1rem' }}>
                                {store?.name?.charAt(0)?.toUpperCase() || <FiUser />}
                            </div>
                            <h4 className="mb-1">{store?.name || 'Mi Tienda'}</h4>
                            <span className={styles.badge}>{store?.plan || 'Starter'} Plan</span>
                        </div>

                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label">Nombre de la Tienda</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light"><FiBriefcase /></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        placeholder="Ej. Mi Boutique"
                                        required
                                    />
                                </div>
                                <div className="form-text">Este nombre será visible en tus facturas y correos.</div>
                            </div>

                            <div className="col-12">
                                <label className="form-label">Correo Electrónico</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light"><FiMail /></span>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        disabled
                                        readOnly
                                        title="El correo no se puede cambiar"
                                    />
                                </div>
                                <div className="form-text">Para cambiar tu correo, contacta con soporte.</div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Idioma</label>
                                <select
                                    className="form-select"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="pt">Português</option>
                                </select>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Región</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light"><FiMapPin /></span>
                                    <select className="form-select" disabled>
                                        <option>Europa (EU)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="col-12 mt-4">
                                <div className="form-check form-switch cursor-pointer">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="notificationsSwitch"
                                        name="notifications"
                                        checked={formData.notifications}
                                        onChange={handleChange}
                                        role="button"
                                    />
                                    <label className="form-check-label user-select-none" htmlFor="notificationsSwitch" role="button">
                                        Recibir notificaciones por correo sobre el rendimiento
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="me-2" /> Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

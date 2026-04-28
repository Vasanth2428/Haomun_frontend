'use client'

import { useState, useEffect, useRef } from 'react'
import { getSanctumData, updateProfile } from '@/lib/api/client'
import { PLATFORMS } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import styles from './profile-page.module.css'

type Tab = 'identity' | 'personal' | 'security'

const DEFAULT_AVATAR = 'https://i.imgur.com/8N0vH2x.png'

export default function ProfilePage() {
    const { user, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState<Tab>('identity')
    const avatarInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [platforms, setPlatforms] = useState({
        [PLATFORMS.LEETCODE]: '',
        [PLATFORMS.CODEFORCES]: '',
        [PLATFORMS.CODECHEF]: '',
        [PLATFORMS.GFG]: ''
    })
    const [personalInfo, setPersonalInfo] = useState({
        username: '',
        email: '',
        bio: '',
        avatarUrl: ''
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (user) {
            setPersonalInfo({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || ''
            })
            if (user.platforms) {
                setPlatforms({
                    [PLATFORMS.LEETCODE]: user.platforms[PLATFORMS.LEETCODE] || '',
                    [PLATFORMS.CODEFORCES]: user.platforms[PLATFORMS.CODEFORCES] || '',
                    [PLATFORMS.CODECHEF]: user.platforms[PLATFORMS.CODECHEF] || '',
                    [PLATFORMS.GFG]: user.platforms[PLATFORMS.GFG] || ''
                })
            }
        }
    }, [user])

    const handleSyncSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        const verifyResult = await getSanctumData()
        if (!verifyResult.success) {
            setMessage({ type: 'error', text: verifyResult.error || 'Failed to verify platform seals' })
            setSaving(false)
            return
        }

        const updateResult = await updateProfile({ platforms })
        if (updateResult.success) {
            setMessage({ type: 'success', text: 'Identity Seal synchronized eternally!' })
            refreshUser()
        } else {
            setMessage({ type: 'error', text: updateResult.error || 'Failed to record synchronization' })
        }
        setSaving(false)
    }

    const handlePersonalSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        let updateResult;
        if (selectedFile) {
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            formData.append('username', personalInfo.username);
            formData.append('email', personalInfo.email);
            formData.append('bio', personalInfo.bio);
            updateResult = await updateProfile(formData);
        } else {
            updateResult = await updateProfile(personalInfo);
        }

        if (updateResult.success) {
            setMessage({ type: 'success', text: 'Personal records updated successfully.' })
            refreshUser()
            setSelectedFile(null)
            setPreviewUrl(null)
        } else {
            setMessage({ type: 'error', text: updateResult.error || 'Failed to update records' })
        }
        setSaving(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setActiveTab('personal');
        }
    }

    const handleSecuritySave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (security.newPassword !== security.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }
        setSaving(true)
        setMessage({ type: '', text: '' })

        const updateResult = await updateProfile({
            currentPassword: security.currentPassword,
            newPassword: security.newPassword
        })

        if (updateResult.success) {
            setMessage({ type: 'success', text: 'Cipher updated successfully.' })
            setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } else {
            setMessage({ type: 'error', text: updateResult.error || 'Security update failed' })
        }
        setSaving(false)
    }

    const triggerAvatarUpload = () => {
        fileInputRef.current?.click();
    }

    const isPlatformSynced = (p: string) => user?.platforms?.[p] === platforms[p as keyof typeof platforms] && platforms[p as keyof typeof platforms] !== ''

    return (
        <div className={`pavilion-container ${styles.fadeIn}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 className="text-gradient-gold" style={{ fontSize: '3rem', marginBottom: '8px' }}>Identity Archival</h1>
                    <p style={{ color: 'var(--haomun-mist)', fontSize: '1.1rem' }}>Manage your digital essence within the HaoMun Order.</p>
                </div>
            </div>

            <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
                <div className="profile-sidebar">
                    <div className="scroll-card glass-panel runic-glow" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div className="avatar-wrapper" style={{ position: 'relative', margin: '0 auto 24px', width: '130px', height: '130px' }}>
                            <div className="avatar-container" onClick={triggerAvatarUpload} style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: 'var(--haomun-charcoal)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid var(--haomun-gold)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}>
                                <Image
                                    src={previewUrl || user?.avatarUrl || DEFAULT_AVATAR}
                                    alt="Avatar"
                                    width={130}
                                    height={130}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'filter 0.3s ease' }}
                                    className={styles.avatarImg}
                                    unoptimized // Since it's external user avatars
                                />
                                <div className={styles.avatarOverlayModern}>
                                    <span style={{ fontSize: '1.5rem' }}>📷</span>
                                </div>
                            </div>

                            {/* Floating Edit Badge */}
                            <div className={styles.avatarEditBadge} onClick={triggerAvatarUpload} aria-label="Edit Avatar">
                                <span>✎</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                                aria-hidden="true"
                            />
                        </div>

                        <h2 style={{ fontSize: '1.3rem', color: 'var(--haomun-scroll)', marginBottom: '4px', fontFamily: 'Cinzel' }}>{user?.username}</h2>

                        <div className={styles.tabMenu} style={{ marginTop: '32px', textAlign: 'left' }}>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'identity' ? styles.active : ''}`}
                                onClick={() => { setActiveTab('identity'); setMessage({ type: '', text: '' }) }}
                            >
                                <span className={styles.tabIcon}>✧</span> Identity Seal
                            </button>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'personal' ? styles.active : ''}`}
                                onClick={() => { setActiveTab('personal'); setMessage({ type: '', text: '' }) }}
                            >
                                <span className={styles.tabIcon}>👤</span> Personal Records
                            </button>
                            <button
                                className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
                                onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }) }}
                            >
                                <span className={styles.tabIcon}>🛡</span> Security Clearances
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-main">
                    {activeTab === 'identity' && (
                        <div className={styles.slideUp}>
                            <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid var(--haomun-gold)' }}>
                                <h3 className="scroll-header" style={{ color: 'var(--haomun-gold-bright)' }}>Synchronize Realms</h3>
                                <p style={{ color: 'var(--haomun-slate)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                    Bind your external platform contributions to calculate your Unified HaoMun Score.
                                </p>

                                <form onSubmit={handleSyncSave}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        {[
                                            { id: PLATFORMS.LEETCODE, label: 'LeetCode Username', icon: '✦' },
                                            { id: PLATFORMS.CODEFORCES, label: 'Codeforces Handle', icon: '⚔' },
                                            { id: PLATFORMS.CODECHEF, label: 'CodeChef Handle', icon: '🍜' },
                                            { id: PLATFORMS.GFG, label: 'GFG Handle', icon: '🤓' }
                                        ].map(p => (
                                            <div className="form-group" key={p.id}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <label className="form-label" style={{ marginBottom: 0 }}>{p.label}</label>
                                                    {isPlatformSynced(p.id) && (
                                                        <span style={{ color: '#4CAF50', fontSize: '0.7rem', fontWeight: 'bold' }}>✓ SYNCHRONIZED</span>
                                                    )}
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        style={{ paddingLeft: '40px', borderColor: isPlatformSynced(p.id) ? 'rgba(76, 175, 80, 0.3)' : '' }}
                                                        placeholder={`Enter ${p.id} handle...`}
                                                        value={platforms[p.id as keyof typeof platforms]}
                                                        onChange={(e) => setPlatforms({ ...platforms, [p.id]: e.target.value })}
                                                    />
                                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>{p.icon}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <button className="btn btn-primary" type="submit" disabled={saving}>
                                            {saving ? 'Binding Seals...' : 'Save & Synchronize'}
                                        </button>
                                        {message.text && activeTab === 'identity' && (
                                            <div style={{ color: message.type === 'success' ? '#4CAF50' : 'var(--haomun-crimson)', fontSize: '0.95rem' }}>
                                                {message.text}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'personal' && (
                        <div className={styles.slideUp}>
                            <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid var(--haomun-primary)' }}>
                                <h3 className="scroll-header" style={{ color: 'var(--haomun-primary)' }}>Personal Records</h3>
                                <p style={{ color: 'var(--haomun-slate)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                    Update your public moniker and communication seal.
                                </p>

                                <form onSubmit={handlePersonalSave}>
                                    <div className="form-group">
                                        <label className="form-label">Moniker (Username)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={personalInfo.username}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Digital Seal (Email)</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={personalInfo.email}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Identity Aspect (Current Image Source)</label>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <input
                                                ref={avatarInputRef}
                                                type="text"
                                                className="form-input"
                                                placeholder="https://example.com/your-avatar.jpg"
                                                value={selectedFile ? `Local File: ${selectedFile.name}` : personalInfo.avatarUrl}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, avatarUrl: e.target.value })}
                                                disabled={!!selectedFile}
                                            />
                                            {selectedFile && (
                                                <button
                                                    type="button"
                                                    className="btn btn-crimson"
                                                    style={{ padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                                >
                                                    Clear Local
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Oracle&apos;s Note (Bio)</label>
                                        <textarea
                                            className="form-input"
                                            style={{ minHeight: '100px', resize: 'vertical' }}
                                            placeholder="Write a brief entry for the eternal records..."
                                            value={personalInfo.bio}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <button className="btn btn-primary" type="submit" disabled={saving}>
                                            {saving ? 'Recording...' : 'Update Records'}
                                        </button>
                                        {message.text && activeTab === 'personal' && (
                                            <div style={{ color: message.type === 'success' ? '#4CAF50' : 'var(--haomun-crimson)', fontSize: '0.95rem' }}>
                                                {message.text}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className={styles.slideUp}>
                            <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid var(--haomun-crimson)' }}>
                                <h3 className="scroll-header" style={{ color: 'var(--haomun-crimson)' }}>Security Clearances</h3>
                                <p style={{ color: 'var(--haomun-slate)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                    Rotate your access cipher to ensure the records remain protected.
                                </p>

                                <form onSubmit={handleSecuritySave}>
                                    <div className="form-group">
                                        <label className="form-label">Current Cipher</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Enter existing password..."
                                            value={security.currentPassword}
                                            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">New Cipher</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Enter new password..."
                                            value={security.newPassword}
                                            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Confirm New Cipher</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            placeholder="Repeat new password..."
                                            value={security.confirmPassword}
                                            onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <button className="btn btn-primary" type="submit" disabled={saving}>
                                            {saving ? 'Verifying...' : 'Update Cipher'}
                                        </button>
                                        {message.text && activeTab === 'security' && (
                                            <div style={{ color: message.type === 'success' ? '#4CAF50' : 'var(--haomun-crimson)', fontSize: '0.95rem' }}>
                                                {message.text}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

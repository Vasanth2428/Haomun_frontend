'use client'

import { useState, useEffect } from 'react'
import styles from './contest-calendar.module.css'
import { getContests } from '@/utils/api'

interface Contest {
    name: string
    url: string
    start_time: string
    end_time: string
    duration: string
    site: string
    in_24_hours: string
    status: string
}

export default function ContestCalendar() {
    const [contests, setContests] = useState<Contest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        const controller = new AbortController()
        fetchContests(controller.signal)
        return () => controller.abort()
    }, [])

    const fetchContests = async (signal?: AbortSignal) => {
        setLoading(true)
        setError('')
        try {
            const result = await getContests(signal)
            if (result.success) {
                // Robust extraction: result.data (direct), result.data.data (nested), result.data.contests (explicit)
                const rawData = result.data.data || result.data.contests || result.data;
                const contestArray = Array.isArray(rawData) ? rawData : [];
                setContests(contestArray)
            } else {
                setError(result.error || 'The celestial oracles are silent.')
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return
            setError('The stellar alignment was lost.')
        } finally {
            setLoading(false)
        }
    }

    const filteredContests = filter === 'All'
        ? contests
        : contests.filter(c => c.site.toLowerCase() === filter.toLowerCase())

    const sites = ['All', ...Array.from(new Set(contests.map(c => c.site)))]

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="pavilion-container" style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 className="text-gradient-gold" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>Contest Rites</h1>
                <p style={{ color: 'var(--haomun-mist)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
                    Observe the celestial alignment of upcoming trials across the competitive realms.
                </p>
            </div>

            <div className="filter-bar glass-panel" style={{
                marginBottom: '40px',
                padding: '12px',
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                overflowX: 'auto',
                border: '1px solid var(--haomun-charcoal)'
            }}>
                {sites.map(site => (
                    <button
                        key={site}
                        className={`btn ${filter === site ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 24px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                        onClick={() => setFilter(site)}
                    >
                        {site}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--haomun-gold)', fontFamily: 'Cinzel' }}>
                    <div className="runic-spinner" style={{ marginBottom: '24px' }}>⚔</div>
                    Consulting the stellar maps...
                </div>
            ) : error ? (
                <div className="scroll-card glass-panel" style={{ borderColor: 'var(--haomun-crimson)', textAlign: 'center', padding: '60px' }}>
                    <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '20px' }}>⚠️</span>
                    <h2 style={{ color: 'var(--haomun-crimson)', fontSize: '1.8rem' }}>Maps Obscured</h2>
                    <p style={{ marginTop: '16px', color: 'var(--haomun-mist)' }}>{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => fetchContests()}
                        style={{ marginTop: '32px', padding: '12px 32px' }}
                    >
                        Retry Consultation
                    </button>
                </div>
            ) : (
                <div className={styles.contestGrid}>
                    {filteredContests.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px', gridColumn: '1 / -1' }}>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>🔭</span>
                            <h3 className="text-gradient-gold" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Clear Skies</h3>
                            <p style={{ color: 'var(--haomun-mist)', marginBottom: '32px' }}>
                                No trials are currently visible in this sector of the heavens. Check other realms or return when the stars align.
                            </p>
                            <button
                                className="btn-text"
                                onClick={() => fetchContests()}
                                style={{ color: 'var(--haomun-gold)', fontWeight: 'bold' }}
                            >
                                REFRESH MAPS
                            </button>
                        </div>
                    ) : (
                        filteredContests.map((contest, index) => (
                            <div key={index} className="scroll-card glass-panel hover-lift" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span className="site-tag" style={{
                                        background: 'rgba(212, 175, 55, 0.1)',
                                        color: 'var(--haomun-gold)',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontFamily: 'Cinzel',
                                        border: '1px solid rgba(212, 175, 55, 0.3)'
                                    }}>
                                        {contest.site}
                                    </span>
                                    {contest.in_24_hours === 'Yes' && (
                                        <span className="pulsing-shard" style={{ color: 'var(--haomun-primary)', fontSize: '0.7rem', fontWeight: 'bold' }}>✦ IMMINENT</span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', minHeight: '3em', color: 'var(--haomun-scroll)' }}>{contest.name}</h3>
                                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--haomun-mist)', marginBottom: '8px' }}>
                                        <span style={{ color: 'var(--haomun-gold)', marginRight: '8px' }}>🕒</span>
                                        {formatDate(contest.start_time)}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--haomun-mist)' }}>
                                        <span style={{ color: 'var(--haomun-primary)', marginRight: '8px' }}>⏳</span>
                                        {Math.floor(parseInt(contest.duration) / 3600)}h {Math.floor((parseInt(contest.duration) % 3600) / 60)}m
                                    </div>
                                </div>
                                <a
                                    href={contest.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ width: '100%', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem', marginTop: 'auto' }}
                                >
                                    Enter Trial
                                </a>
                            </div>
                        ))
                    )}
                </div>
            )}

        </div>
    )
}

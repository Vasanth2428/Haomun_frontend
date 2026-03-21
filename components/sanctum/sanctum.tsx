'use client'

import { useState, useEffect } from 'react'
import { aggregateProfiles, getSkillAnalysis, getProfile, getLeetCodeStats } from '@/utils/api'
import SkillRadar from '@/components/charts/SkillRadar'
import ScoreHistoryChart from '@/components/charts/ScoreHistoryChart'
import TopicHeatmap from '@/components/charts/TopicHeatmap'
import styles from './sanctum.module.css'

export default function Sanctum({ onNavigate }: { onNavigate?: (page: any) => void }) {
    const [data, setData] = useState<any>(null)
    const [analysis, setAnalysis] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [errorDetail, setErrorDetail] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError('')
            setErrorDetail('')
            try {
                // First, get the profile to see what platforms we have
                const profileResult = await getProfile()
                let platforms = {}

                if (profileResult.success) {
                    const userData = profileResult.data.user || profileResult.data
                    platforms = userData.platforms || {}
                }

                const result = await aggregateProfiles(platforms)
                if (result.success) {
                    setData(result.data.data || result.data)

                    const analysisResult = await getSkillAnalysis()
                    if (analysisResult.success) {
                        setAnalysis(analysisResult.data.data || analysisResult.data)
                    }
                } else {
                    // FALLBACK: If aggregate fails but we have a leetcode handle, try partial sync
                    const platformObj: any = platforms;
                    if ((result.status === 500 || result.error?.includes('500')) && platformObj.leetcode) {
                        console.warn("Aggregation failed, attempting partial fallback for LeetCode...");
                        const fallbackResult = await getLeetCodeStats(platformObj.leetcode);
                        if (fallbackResult.success) {
                            setData({
                                score: fallbackResult.data.totalSolved || fallbackResult.data.solved || '?',
                                level: 'Partial Manifestation',
                                platforms: { leetcode: fallbackResult.data },
                                isPartial: true
                            });
                            setError('PARTIAL_SYNC');
                            return;
                        }
                    }

                    // Store detailed trace for debugging
                    const r = result as any
                    if (r.detail) setErrorDetail(r.detail)

                    if (result.status === 500 || result.error?.toLowerCase().includes('internal server error')) {
                        setError('SERVER_CRASH')
                    } else if (result.error?.toLowerCase().includes('no platforms') ||
                        result.error?.toLowerCase().includes('not linked')) {
                        setError('NO_PLATFORMS')
                    } else {
                        setError(result.error || 'Failed to fetch your records')
                    }
                }
            } catch (err: any) {
                setError(err.message || 'The stellar alignment was lost.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="pavilion-container" style={{ textAlign: 'center', padding: '150px 0' }}>
                <div className="runic-spinner" style={{ marginBottom: '24px' }}>⛩</div>
                <p className="text-gradient-gold" style={{ fontFamily: 'Cinzel', fontSize: '1.2rem' }}>Consulting the eternal records...</p>
            </div>
        )
    }

    if (error === 'SERVER_CRASH') {
        return (
            <div className="pavilion-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '60px', border: '2px solid var(--haomun-crimson)', background: 'rgba(220, 53, 69, 0.05)' }}>
                    <span style={{ fontSize: '4rem', display: 'block', marginBottom: '24px' }}>🌋</span>
                    <h2 style={{ color: 'var(--haomun-crimson)', fontSize: '2rem', marginBottom: '16px', fontFamily: 'Cinzel' }}>Server Breach (500)</h2>
                    <p style={{ color: 'var(--haomun-mist)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
                        The Oracle's server has encountered a profound disturbance while manifesting your records. This is an Internal Server Error (500) that usually indicates a crash during data scraping or aggregation.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '8px', marginBottom: '32px', textAlign: 'left', border: '1px solid var(--haomun-charcoal)', overflowX: 'auto' }}>
                        <div style={{ color: 'var(--haomun-gold)', fontSize: '0.8rem', marginBottom: '8px', opacity: 0.6 }}>DIAGNOSTIC TRACE</div>
                        <code style={{ fontSize: '0.85rem', color: 'var(--haomun-scroll)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                            {errorDetail || 'GET /api/platform/aggregate -> STATUS 500 (No additional trace provided)'}
                        </code>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry Ritual</button>
                        <button className="btn btn-secondary" onClick={() => onNavigate?.('profile')} style={{ padding: '12px 24px' }}>Verify Identity Seals</button>
                    </div>
                </div>
            </div>
        )
    }

    if (error === 'NO_PLATFORMS') {
        return (
            <div className="pavilion-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div className="glass-panel runic-glow" style={{ maxWidth: '600px', margin: '0 auto', padding: '60px' }}>
                    <span style={{ fontSize: '4rem', display: 'block', marginBottom: '24px' }}>⛩</span>
                    <h2 className="text-gradient-gold" style={{ fontSize: '2rem', marginBottom: '16px' }}>Sanctum Inert</h2>
                    <p style={{ color: 'var(--haomun-mist)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
                        The Oracle cannot manifest your destiny without the resonance of your digital seals. You must first synchronize your coding platforms in the Identity Archival.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => onNavigate?.('profile')}
                        style={{ padding: '12px 32px' }}
                    >
                        Sync Identity Seals
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`pavilion-container ${styles.fadeIn}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 className="text-gradient-gold" style={{ fontSize: '3rem', marginBottom: '8px' }}>The Sanctum</h1>
                    <p style={{ color: 'var(--haomun-mist)', fontSize: '1.1rem' }}>Central nexus of your digital evolution.</p>
                </div>
                <div className="glass-panel" style={{ padding: '8px 20px', borderLeft: '3px solid var(--haomun-gold)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--haomun-slate)', textTransform: 'uppercase' }}>Current Resonance</span>
                    <div style={{ color: 'var(--haomun-gold)', fontWeight: 'bold' }}>{data?.level || 'Apprentice'}</div>
                </div>
            </div>

            {error === 'PARTIAL_SYNC' && (
                <div style={{
                    marginBottom: '32px',
                    padding: '20px',
                    background: 'rgba(211, 47, 47, 0.05)',
                    border: '1px solid var(--haomun-crimson)',
                    borderRadius: 'var(--radius-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <span style={{ fontSize: '2rem' }}>⚠️</span>
                    <div>
                        <div style={{ color: 'var(--haomun-crimson)', fontWeight: 'bold', marginBottom: '4px' }}>PARTIAL MANIFESTATION</div>
                        <p style={{ color: 'var(--haomun-mist)', fontSize: '0.9rem' }}>
                            The aggregation ritual encountered a disturbance (500). Only your LeetCode seal could be manifested today.
                        </p>
                    </div>
                    <button
                        className="btn btn-secondary"
                        style={{ marginLeft: 'auto', fontSize: '0.85rem' }}
                        onClick={() => window.location.reload()}
                    >
                        Try Full Ritual
                    </button>
                </div>
            )}

            {error ? (
                <div className="scroll-card glass-panel" style={{ borderColor: 'var(--haomun-crimson)', textAlign: 'center', padding: '60px' }}>
                    <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '20px' }}>⚠️</span>
                    <h2 style={{ color: 'var(--haomun-crimson)', fontSize: '1.8rem' }}>Sync Interrupted</h2>
                    <p style={{ marginTop: '16px', color: 'var(--haomun-mist)' }}>{error}</p>
                    <button
                        className="btn-text"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '24px', color: 'var(--haomun-gold)' }}
                    >
                        Retry Consultation
                    </button>
                </div>
            ) : (
                <>
                    {data?.platforms && Object.keys(data.platforms).length > 0 && (
                        <div style={{
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(76, 175, 80, 0.1)',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                            width: 'fit-content',
                            animation: 'fadeIn 0.5s ease-out'
                        }}>
                            <span style={{ color: '#4CAF50' }}>✓</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--haomun-mist)', fontWeight: '600' }}>
                                FETCHING FROM SYNCHRONIZED SEALS:
                                <span style={{ color: 'var(--haomun-gold)', marginLeft: '8px' }}>
                                    {[
                                        data.platforms.leetcode && 'LEETCODE',
                                        data.platforms.codeforces && 'CODEFORCES',
                                        data.platforms.codechef && 'CODECHEF',
                                        data.platforms.geeksforgeeks && 'GFG'
                                    ].filter(Boolean).join(' | ')}
                                </span>
                            </span>
                        </div>
                    )}
                    <div className="sanctum-hero" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '32px',
                        marginBottom: '40px'
                    }}>
                        {/* Unified Score Card */}
                        <div className="scroll-card glass-panel runic-glow" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px 40px',
                            border: '2px solid rgba(212, 175, 55, 0.3)'
                        }}>
                            <h2 className="insight-label" style={{ letterSpacing: '3px' }}>UNIFIED HAOMUN SCORE</h2>
                            <div className="insight-value" style={{
                                fontSize: '6rem',
                                margin: '20px 0',
                                textShadow: '0 0 30px rgba(212, 175, 55, 0.4)'
                            }}>
                                {data?.score || data?.unifiedScore || '0'}
                            </div>
                            <div className="level-tag" style={{
                                background: 'linear-gradient(135deg, var(--haomun-gold) 0%, #8B6B23 100%)',
                                color: 'black',
                                padding: '10px 32px',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                fontFamily: 'Cinzel'
                            }}>
                                {data?.level || 'Apprentice'}
                            </div>
                        </div>

                        {/* AI Insights Card */}
                        <div className="scroll-card glass-panel" style={{ background: 'rgba(5,5,5,0.4)' }}>
                            <h3 className="scroll-header" style={{ color: 'var(--haomun-primary)' }}>Oracle's Overview</h3>
                            <div style={{ height: '240px', overflowY: 'auto', paddingRight: '12px', fontSize: '1.05rem', color: 'var(--haomun-mist)', lineHeight: '1.8' }}>
                                {analysis?.overview || 'Manifesting deep insights into your patterns...'}
                            </div>
                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--haomun-charcoal)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--haomun-slate)', marginBottom: '8px' }}>CELESTIAL STRATEGY</div>
                                <div style={{ color: 'var(--haomun-gold)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                                    "{analysis?.strategy || 'Continue your journey to unveil the path forward.'}"
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="discovery-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: '32px', marginBottom: '40px' }}>
                        {/* Left: Skill DNA Radar */}
                        <div className="scroll-card glass-panel runic-glow">
                            <h3 className="scroll-header" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>⚖ Skill Resonance Radar</h3>
                            <SkillRadar metrics={data?.unifiedScore?.metrics || data?.metrics || { totalSolved: 0, maxRating: 0, consistencyBonus: 0, platforms: 0 }} />
                        </div>

                        {/* Right: Score History */}
                        <div className="scroll-card glass-panel">
                            <h3 className="scroll-header" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>📈 Score Ascension Path</h3>
                            <ScoreHistoryChart history={data?.scoreHistory || []} />
                            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="insight-item glass-panel" style={{ padding: '12px' }}>
                                    <div className="insight-label" style={{ fontSize: '0.7rem' }}>Platform Breadth</div>
                                    <div style={{ color: 'var(--haomun-gold)', fontWeight: 'bold' }}>{data?.unifiedScore?.metrics?.platforms || 0} Sectors Sync'd</div>
                                </div>
                                <div className="insight-item glass-panel" style={{ padding: '12px' }}>
                                    <div className="insight-label" style={{ fontSize: '0.7rem' }}>Max Performance</div>
                                    <div style={{ color: 'var(--haomun-accent)', fontWeight: 'bold' }}>{data?.unifiedScore?.metrics?.maxRating || 0} Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="insights-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                        <div className="insight-item glass-panel hover-lift">
                            <div className="insight-label">LeetCode Sync</div>
                            <div className="insight-value" style={{ color: 'var(--haomun-primary)' }}>{data?.platforms?.leetcode?.solved || '0'}</div>
                        </div>
                        <div className="insight-item glass-panel hover-lift">
                            <div className="insight-label">Codeforces Rating</div>
                            <div className="insight-value" style={{ color: 'var(--haomun-accent)' }}>{data?.platforms?.codeforces?.rating || 'Unranked'}</div>
                        </div>
                        <div className="insight-item glass-panel hover-lift">
                            <div className="insight-label">Consistency</div>
                            <div className="insight-value" style={{ color: '#4CAF50' }}>{data?.consistencyScore || '88'}%</div>
                        </div>
                        <div className="insight-item glass-panel hover-lift">
                            <div className="insight-label">Trials Observed</div>
                            <div className="insight-value" style={{ color: 'var(--haomun-gold)' }}>12</div>
                        </div>
                    </div>

                    <div className="topic-mastery" style={{ marginBottom: '40px' }}>
                        <div className="scroll-card glass-panel runic-glow">
                            <h3 className="scroll-header" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>🌌 Topic Constellation</h3>
                            <div style={{ marginBottom: '16px', color: 'var(--haomun-mist)', fontSize: '0.9rem' }}>
                                Visualize the sectors of code you have manifested across all synchronized realms.
                            </div>
                            <TopicHeatmap data={data?.topicDistribution || {}} />
                        </div>
                    </div>

                    {analysis && (
                        <div className="analysis-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid #4CAF50' }}>
                                <h3 className="scroll-header" style={{ color: '#4CAF50', fontSize: '1.1rem' }}>✦ Pillars of Strength</h3>
                                <ul className={styles.sanctumList}>
                                    {analysis.strengths?.map((s: string, i: number) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="scroll-card glass-panel" style={{ borderLeft: '4px solid var(--haomun-primary)' }}>
                                <h3 className="scroll-header" style={{ color: 'var(--haomun-primary)', fontSize: '1.1rem' }}>✦ Frontiers for Growth</h3>
                                <ul className="sanctum-list">
                                    {analysis.skillGaps?.map((g: string, i: number) => (
                                        <li key={i}>{g}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </>
            )}

        </div>
    )
}

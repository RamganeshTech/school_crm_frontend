import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from './AccountDeletion.module.css';

const AccountDeletion: React.FC = () => {
    const navigate = useNavigate();
    const appName = "BMB School App";
    const supportEmail = "ramstechcircle@gmail.com";

    return (
        <div className={style.deletionContainer}>
            <nav className={style.navbar}>
                <div className={style.logoArea}>
                    {/* <div style={{width: '35px', height: '35px', backgroundColor: '#f97316', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>B</div> */}
                    <span className={style.appName}>{appName}</span>
                </div>
                <button className={style.backLink} onClick={() => navigate(-1)}>Back to Home</button>
            </nav>

            <main className={style.mainContent}>
                <div className={style.deletionCard}>
                    <h1 className={style.headerText}>Delete Account</h1>

                    {/* Red Danger Banner */}
                    <div style={{
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <span style={{fontSize: '1.5rem'}}>⚠️</span>
                        <div>
                            <h4 style={{color: '#9f1239', margin: 0, fontWeight: 700}}>Account Deletion Request</h4>
                            <p style={{color: '#be123c', margin: '4px 0 0 0', fontSize: '0.95rem'}}>This action is permanent and cannot be undone.</p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div style={{
                        backgroundColor: '#fffbeb',
                        borderLeft: '4px solid #f59e0b',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '4px',
                        marginBottom: '2.5rem'
                    }}>
                        <p style={{color: '#92400e', margin: 0, lineHeight: '1.6', fontWeight: 500}}>
                            Important: Deletion requests must be processed through your school administration or our official support team to comply with educational data regulations.
                        </p>
                    </div>

                    {/* Who to Contact Section */}
                    <div className={style.sectionHeading}>
                        <span>👥</span> Who to Contact
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                        <div style={{border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '12px'}}>
                            <h4 style={{margin: '0 0 8px 0', color: '#334155'}}>School Correspondent</h4>
                            <p style={{margin: 0, fontSize: '0.9rem', color: '#64748b'}}>Your primary contact for management and profile removal.</p>
                        </div>
                        <div style={{border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '12px'}}>
                            <h4 style={{margin: '0 0 8px 0', color: '#334155'}}>Support Team</h4>
                            <a href={`mailto:${supportEmail}`} style={{color: '#2563eb', fontWeight: 600, textDecoration: 'none'}}>{supportEmail}</a>
                            <p style={{margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b'}}>Reach out to our global support desk for manual deletion.</p>
                        </div>
                    </div>

                    {/* Deletion Process Section */}
                    <div className={style.sectionHeading}>
                        <span>🔄</span> Deletion Process
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        <div className={style.stepRow}>
                            <div className={style.stepNumber}>1</div>
                            <p style={{margin: 0, color: '#475569', fontWeight: 500}}>Contact your school correspondent or support team via the channels above.</p>
                        </div>
                        <div className={style.stepRow}>
                            <div className={style.stepNumber}>2</div>
                            <p style={{margin: 0, color: '#475569', fontWeight: 500}}>Provide your account credentials and the specific reason for your request.</p>
                        </div>
                        <div className={style.stepRow}>
                            <div className={style.stepNumber}>3</div>
                            <p style={{margin: 0, color: '#475569', fontWeight: 500}}>Await verification. Processing typically takes <span style={{color: '#000', fontWeight: 700}}>7 business days</span>.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className={style.footer}>
                © {new Date().getFullYear()} {appName} Management System. All rights reserved.
            </footer>
        </div>
    );
};

export default AccountDeletion;
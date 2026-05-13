
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from './PrivacyPolicy.module.css';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();
    // const domain = import.meta.env.VITE_APP_BASE_API;
    const appName = "BMB School App";
    // const companyName = "Build My Business";
    const supportEmail = "ramstechcircle@gmail.com";

    return (
        <div className={style.privacyContainer}>
            {/* Navigation Bar */}
            <nav className={style.navbar}>
                <div className={style.logoArea}>
                    {/* <div className={style.logoCircle}>B</div> */}
                    <span className={style.appName}>{appName}</span>
                </div>
                <button className={style.backLink} onClick={() => navigate(-1)}>
                    Back to Home
                </button>
            </nav>

            {/* Main Content */}
            <main className={style.mainContent}>
                <h1 className={style.mainTitle}>Privacy Policy</h1>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>1. Introduction</h2>
                    <p>
                        Welcome to <strong>{appName}</strong> ("we," "our," or "us"). We provide a school management platform that allows multiple educational institutions to manage student data, teacher records, academic years, and school-wide communications.
                    </p>
                    <p className="mt-4">
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website. By using our service, you agree to the terms of this policy.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>2. Information We Collect</h2>
                    <p className="mb-4">To provide a functional school management system, we collect the following types of information:</p>
                    <div className={style.contentBlock}>
                        <span className={style.boldHeader}>School Data:</span>
                        <p>Name of the institution, administrator contact details, and authentication credentials.</p>
                    </div>
                    <div className={style.contentBlock}>
                        <span className={style.boldHeader}>Staff Data:</span>
                        <p>Names, email addresses, and assigned classes.</p>
                    </div>
                    <div className={style.contentBlock}>
                        <span className={style.boldHeader}>Student Data:</span>
                        <p>Names, enrollment numbers, academic year data, grades, and attendance records (provided by the school administration).</p>
                    </div>
                    <div className={style.contentBlock}>
                        <span className={style.boldHeader}>User-Generated Content:</span>
                        <p>Announcements, messages, and files uploaded by authorized school users.</p>
                    </div>
                    <div className={style.contentBlock}>
                        <span className={style.boldHeader}>Device Information:</span>
                        <p>We may collect technical data like IP address, to ensure app stability and security.</p>
                    </div>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>3. How We Use Your Information</h2>
                    <p>We use the collected data strictly for educational and administrative purposes, including:</p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>To facilitate the creation and management of student and teacher profiles.</li>
                        <li>To organize and store academic year records.</li>
                        <li>To send school-wide announcements and notifications to users.</li>
                        <li>To provide technical support and ensure the security of the multi-tenant architecture.</li>
                    </ul>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>4. Data Privacy for Minors (Children)</h2>
                    <p>As this app handles student data, we comply with strict regulations regarding children's privacy.</p>
                    <div className="mt-4 space-y-4">
                        <p><strong>No Direct Marketing:</strong> We do not use student data for advertising or marketing.</p>
                        <p><strong>Institutional Consent:</strong> We rely on the School/Educational Institution to obtain necessary parental consent before entering student information into our platform.</p>
                        <p><strong>Data Control:</strong> Parents or legal guardians can request to review or delete their child's data through the respective school administration.</p>
                    </div>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>5. Data Sharing and Disclosure</h2>
                    <p>We do not sell your data to third parties. Data is only shared in the following circumstances:</p>
                    <div className="mt-4 space-y-4">
                        <p><strong>Within the School:</strong> Data is shared between authorized administrators, teachers, and students/parents as designated by the school’s internal policies.</p>
                        <p><strong>Service Providers:</strong> We may use third-party hosting (e.g., AWS). These providers are contractually obligated to keep data confidential.</p>
                        <p><strong>Legal Requirements:</strong> If required by law, we may disclose information to comply with legal obligations or protect the safety of our users.</p>
                    </div>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>6. Data Security</h2>
                    <p>We implement industry-standard security measures, including encryption and secure multi-tenant isolation, to ensure that one school’s data is never accessible by another school on the platform.</p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>7. Data Retention and Deletion</h2>
                    <p>We retain data as long as the school maintains an active subscription with us.</p>
                    <p className="mt-4">
                        <strong>Account Deletion:</strong> Users or schools can request account deletion by contacting <span className={style.emailHighlight}>{supportEmail}</span>.
                    </p>
                    <p className="mt-2 font-semibold">
                        Upon successful verification, personal data including account information will be permanently deleted within 7 working days.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>8. Your Rights</h2>
                    <p>Depending on your location, you may have the right to access, correct, or delete your personal information. These requests should generally be directed to your school administrator, who manages the data on our platform.</p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>9. Changes to This Policy</h2>
                    {/* <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy within the app and updating the "Last Updated" date.</p> */}
                    <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date.</p>
                </section>

                {/* New Section 10: Account & Data Deletion */}
                <section className={style.section}>
                    <h2 className={style.sectionTitle}>10. Account & Data Deletion</h2>
                    <p>Users have the right to request deletion of their account and associated personal data from the <strong>{appName}</strong> platform.</p>
                    <p>Account deletion requests are reviewed and processed by an correspondent to prevent unauthorized or accidental deletion.</p>
                    <p>To request account deletion, users must send an email from their registered email address to:</p>
                    <p className={style.emailHighlight}>{supportEmail}</p>
                    <p>Please include your registered name, school name, and role (Admin/Teacher/Accountant) in the request for verification purposes.</p>
                    <p>
                        Upon successful verification, personal data including account information will be permanently deleted within <span className={style.deletionHighlight}>7 working days</span>.
                    </p>
                    <p className={style.subText}>
                        For more details, users may visit our <Link to="/account-deletion" className={style.emailHighlight}>Account Deletion page</Link>.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>11. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>


                    <div
                        style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            display: 'inline-block',
                            minWidth: '300px'
                        }}
                    >
                        {/* Address Row */}
                        <div style={{ display: 'flex', marginTop: '0rem', alignItems: 'flex-start' }}>
                            <strong style={{ width: '80px', flexShrink: 0 }}>Address:</strong>
                            <span style={{ flex: 1 }}>
                                13th, Main Road, Anna Nagar West, Anna Nagar (Chennai),<br />
                                Chennai, Egmore Nungambakkam, Tamil Nadu, India, 600040.
                            </span>
                        </div>

                        {/* Email Row */}
                        <div style={{ display: 'flex', marginTop: '0.2rem', alignItems: 'center' }}>
                            <strong style={{ width: '80px', flexShrink: 0 }}>Email:</strong>
                            <span className={style.emailHighlight} style={{ flex: 1 }}>
                                {supportEmail}
                            </span>
                        </div>

                        {/* Phone Row (Optional, based on your previous messages) */}
                        <div style={{ display: 'flex', marginTop: '0.2rem', alignItems: 'center' }}>
                            <strong style={{ width: '80px', flexShrink: 0 }}>Phone:</strong>
                            <span style={{ flex: 1 }}>
                                +91 93639 93814
                            </span>
                        </div>

                        {/* Website Row */}
                        <div style={{ display: 'flex', marginTop: '0.2rem', alignItems: 'center' }}>
                            <strong style={{ width: '80px', flexShrink: 0 }}>Website:</strong>
                            <a
                                href="https://www.bmbproducts.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={style.emailHighlight}
                                style={{ textDecoration: 'underline', flex: 1 }}
                            >
                                https://www.bmbproducts.com
                            </a>
                        </div>
                    </div>

                </section>





            </main>

            <footer className={style.footer}>
                &copy; {new Date().getFullYear()} {appName} Management System. All rights reserved.
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
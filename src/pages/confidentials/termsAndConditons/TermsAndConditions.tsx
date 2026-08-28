import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../PrivacyPolicy.module.css';
import { DOMAIN_NAME } from '../../../constants/constants';

const TermsAndConditions: React.FC = () => {
    const navigate = useNavigate();
    const supportEmail = "ramstechcircle@gmail.com";

    return (
        <div className={style.privacyContainer}>
            {/* Navigation Bar */}
            <nav className={style.navbar}>
                <div className={style.logoArea}>
                    <span className={style.appName}>{DOMAIN_NAME}</span>
                </div>
                <button className={style.backLink} onClick={() => navigate(-1)}>
                    Back to Home
                </button>
            </nav>

            {/* Main Content */}
            <main className={style.mainContent}>
                <h1 className={style.mainTitle}>Terms and Conditions</h1>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>1. Introduction</h2>
                    <p>
                        Welcome to <strong>{DOMAIN_NAME}</strong> ("we," "our," "us," or the "Platform"). {DOMAIN_NAME} is a school management platform that allows educational institutions to manage student data, teacher records, academic years, fee collection, and school-wide communications.
                    </p>
                    <p className="mt-4">
                        These Terms and Conditions ("Terms") govern your access to and use of the {DOMAIN_NAME} website, mobile application, and desktop application (collectively, the "Service"). By registering for, accessing, or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
                    </p>
                    <p className="mt-4">
                        Published by <strong>RAMS TECH CIRCLE OPC PRIVATE LIMITED</strong>, operating as <strong>Build My Business</strong>
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>2. Who May Use the Service</h2>
                    <p>
                        The Service is intended for use by educational institutions ("Schools") and their authorized administrators, teachers, accountants, staff, students, and parents/guardians (collectively, "Users"), each acting under permissions granted by the School.
                    </p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>Schools must ensure that any individual they onboard onto the Platform is authorized to access the data made available to them.</li>
                        <li>Users accessing the Service on behalf of a minor (student) must be a parent, legal guardian, or authorized school representative.</li>
                        <li>You must provide accurate registration information and keep your login credentials confidential.</li>
                    </ul>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>3. School and Administrator Responsibilities</h2>
                    <p>Schools that register on {DOMAIN_NAME} are responsible for:</p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>Obtaining any necessary consent from parents, guardians, or staff before entering their data into the Platform.</li>
                        <li>Ensuring that the data entered (student records, grades, attendance, fee details, etc.) is accurate and lawfully collected.</li>
                        <li>Managing access permissions for teachers, accountants, and other staff accounts created under their School.</li>
                        <li>Promptly notifying us of any unauthorized use of their School's account.</li>
                    </ul>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>4. Acceptable Use</h2>
                    <p>When using the Service, you agree that you will not:</p>
                    <ul className="list-disc ml-6 mt-4 space-y-2">
                        <li>Use the Platform for any unlawful purpose or in violation of any applicable local, state, national, or international law.</li>
                        <li>Attempt to gain unauthorized access to another School's data, accounts, or systems, including through the offline/desktop application's local sync features.</li>
                        <li>Upload or transmit any content that is defamatory, harassing, obscene, or that infringes on the rights of any third party.</li>
                        <li>Interfere with, disrupt, reverse-engineer, or attempt to extract the source code of the Service, except where permitted by law.</li>
                        <li>Use automated means (bots, scrapers) to access the Service without our prior written consent.</li>
                    </ul>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>5. Fees, Billing, and Subscriptions</h2>
                    <p>
                        Access to certain features of {DOMAIN_NAME} may require payment of subscription fees by the School. All fees are as agreed between the School and {DOMAIN_NAME} at the time of onboarding or as published on our website.
                    </p>
                    <div className="mt-4 space-y-4">
                        <p><strong>Fee Collection Module:</strong> Where the Platform is used by Schools to record and manage student fee collection, {DOMAIN_NAME} acts solely as a record-keeping and management tool. We are not a party to, and assume no liability for, the underlying financial transaction between the School and the student/parent.</p>
                        <p><strong>Non-Payment:</strong> We reserve the right to suspend or restrict access to the Service if subscription fees remain unpaid after reasonable notice.</p>
                        {/* <p><strong>Refunds:</strong> Refunds, if any, are governed by the specific commercial agreement entered into with the School and are handled on a case-by-case basis.</p> */}
                    </div>
                </section>

                {/* <section className={style.section}>
                    <h2 className={style.sectionTitle}>6. Offline / Desktop Application</h2>
                    <p>
                        {DOMAIN_NAME}'s desktop application allows Schools to operate certain modules offline, with data synced across devices on the same local network. Schools are responsible for the security of the local network and devices on which the desktop application is installed, including safeguarding locally stored data against unauthorized physical or network access.
                    </p>
                </section> */}

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>6. Data and Privacy</h2>
                    <p>
                        Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect data on the Platform. By using the Service, you consent to the practices described in the Privacy Policy.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>7. Intellectual Property</h2>
                    <p>
                        The Service, including its software, design, logos, and content (excluding data uploaded by Schools), is the property of RAMS TECH CIRCLE OPC PRIVATE LIMITED and is protected by applicable intellectual property laws. Nothing in these Terms grants you any right to use our trademarks, logos, or branding without prior written consent.
                    </p>
                    <p className="mt-4">
                        Data that Schools upload (student records, grades, files, etc.) remains the property of the respective School. We claim no ownership over such data and use it solely to provide and improve the Service.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>8. Service Availability</h2>
                    <p>
                        We strive to keep the Service available and reliable but do not guarantee uninterrupted or error-free operation. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our reasonable control.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>9. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by applicable law, {DOMAIN_NAME} and RAMS TECH CIRCLE OPC PRIVATE LIMITED shall not be liable for any indirect, incidental, special, or consequential damages, including loss of data, revenue, or business opportunity, arising out of or related to your use of the Service.
                    </p>
                    <p className="mt-4">
                        The Service is provided on an "as is" and "as available" basis, without warranties of any kind, whether express or implied, except as required by applicable law.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>10. Suspension and Termination</h2>
                    <p>
                        We reserve the right to suspend or terminate access to the Service, with or without notice, if a School or User violates these Terms, misuses the Platform, or engages in conduct that we reasonably believe is harmful to other Users or to the integrity of the Service.
                    </p>
                    <p className="mt-4">
                        Schools may request termination of their account and deletion of associated data as described in our Privacy Policy and Account Deletion page.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>11. Changes to These Terms</h2>
                    <p>
                        We may update these Terms from time to time to reflect changes to the Service or legal requirements. Material changes will be posted on this page with a revised effective date. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu, India.
                    </p>
                </section>

                <section className={style.section}>
                    <h2 className={style.sectionTitle}>13. Contact Us</h2>
                    <p>If you have any questions about these Terms and Conditions, please contact us at:</p>

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

                        {/* Phone Row */}
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
                                href="https://dailygrades.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={style.emailHighlight}
                                style={{ textDecoration: 'underline', flex: 1 }}
                            >
                                https://dailygrades.com
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className={style.footer}>
                &copy; {new Date().getFullYear()} {DOMAIN_NAME} Management System. All rights reserved.
            </footer>
        </div>
    );
};

export default TermsAndConditions;
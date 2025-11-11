import React from 'react';
import { MdLocationOn, MdEmail, MdPhone } from 'react-icons/md';
import { FaBriefcase, FaGraduationCap, FaAward, FaUsers, FaLinkedin, FaGithub } from 'react-icons/fa';
import InternSidebar from "../../components/Layout/InternSidebar";

export default function ProfilePage() {
    const experiences = [
        {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            period: '2022 - Present',
            description: 'Leading frontend development team and architecting scalable React applications.'
        },
        {
            title: 'Software Engineer',
            company: 'StartUp Inc',
            period: '2020 - 2022',
            description: 'Developed web applications using React, Node.js, and MongoDB.'
        }
    ];

    const education = [
        {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of Technology',
            year: '2016 - 2020'
        }
    ];

    const skills = [
        'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python',
        'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git'
    ];

    return (
        <div className="dashboard-layout" styles="position:relative;">
            {/* Sidebar bên trái */}
            <InternSidebar />
            <div style={styles.container}>
                {/* Animated Background */}
                <div style={styles.backgroundOverlay}></div>

                {/* Header Banner */}
                <div style={styles.banner}>
                    <div style={styles.bannerPattern}></div>
                </div>

                <div style={styles.content}>
                    {/* Profile Card */}
                    <div style={{ ...styles.card, ...styles.profileCard }}>
                        <div style={styles.profileLayout}>
                            {/* Profile Picture */}
                            <div style={styles.avatarContainer}>
                                <div style={styles.avatar}>
                                    <div style={styles.avatarInner}>JD</div>
                                </div>
                                <div style={styles.statusBadge}>🟢</div>
                            </div>

                            {/* Profile Info */}
                            <div style={styles.profileInfo}>
                                <h1 style={styles.name}>John Doe</h1>
                                <p style={styles.title}>Senior Software Engineer | Full Stack Developer</p>
                                <div style={styles.metaInfo}>
                                    <div style={styles.metaItem}>
                                        <MdLocationOn size={16} />
                                        <span>San Francisco, CA</span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <FaUsers size={16} />
                                        <span>500+ connections</span>
                                    </div>
                                </div>
                                <div style={styles.buttonGroup}>
                                    <button style={styles.primaryButton}>Connect</button>
                                    <button style={styles.secondaryButton}>Message</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>About</h2>
                        <p style={styles.aboutText}>
                            Passionate software engineer with 5+ years of experience in building scalable web applications.
                            Specialized in React, Node.js, and cloud technologies. I love solving complex problems and
                            creating intuitive user experiences. Always eager to learn new technologies and share knowledge
                            with the community.
                        </p>
                    </div>

                    {/* Experience Section */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <FaBriefcase size={24} style={styles.sectionIcon} />
                            Experience
                        </h2>
                        <div style={styles.experienceList}>
                            {experiences.map((exp, index) => (
                                <div key={index} style={styles.experienceItem}>
                                    <div style={styles.experienceIconContainer}>
                                        <div style={styles.experienceIcon}>
                                            <FaBriefcase size={20} />
                                        </div>
                                    </div>
                                    <div style={styles.experienceContent}>
                                        <h3 style={styles.experienceTitle}>{exp.title}</h3>
                                        <p style={styles.experienceCompany}>{exp.company}</p>
                                        <p style={styles.experiencePeriod}>{exp.period}</p>
                                        <p style={styles.experienceDescription}>{exp.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <FaGraduationCap size={24} style={styles.sectionIcon} />
                            Education
                        </h2>
                        {education.map((edu, index) => (
                            <div key={index} style={styles.educationItem}>
                                <div style={styles.educationIconContainer}>
                                    <div style={styles.educationIcon}>
                                        <FaGraduationCap size={20} />
                                    </div>
                                </div>
                                <div>
                                    <h3 style={styles.educationDegree}>{edu.degree}</h3>
                                    <p style={styles.educationSchool}>{edu.school}</p>
                                    <p style={styles.educationYear}>{edu.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Skills Section */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <FaAward size={24} style={styles.sectionIcon} />
                            Skills
                        </h2>
                        <div style={styles.skillsGrid}>
                            {skills.map((skill, index) => (
                                <span key={index} style={styles.skillBadge}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>Contact</h2>
                        <div style={styles.contactList}>
                            <div style={styles.contactItem}>
                                <MdEmail size={20} style={styles.contactIcon} />
                                <span>john.doe@email.com</span>
                            </div>
                            <div style={styles.contactItem}>
                                <MdPhone size={20} style={styles.contactIcon} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div style={styles.contactItem}>
                                <FaLinkedin size={20} style={styles.contactIcon} />
                                <span>linkedin.com/in/johndoe</span>
                            </div>
                            <div style={styles.contactItem}>
                                <FaGithub size={20} style={styles.contactIcon} />
                                <span>github.com/johndoe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        paddingBottom: '40px',
    },
    backgroundOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
    },
    banner: {
        height: '240px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
    },
    bannerPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)',
    },
    content: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 20px',
        marginTop: '-160px',
        position: 'relative',
        zIndex: 1,
    },
    card: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255,255,255,0.8)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    profileCard: {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
    },
    profileLayout: {
        display: 'flex',
        flexDirection: 'row',
        gap: '32px',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    avatarContainer: {
        position: 'relative',
        flexShrink: 0,
    },
    avatar: {
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '6px',
        boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '64px',
        fontWeight: 'bold',
        border: '4px solid white',
    },
    statusBadge: {
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        fontSize: '28px',
        background: 'white',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    },
    profileInfo: {
        flex: 1,
        minWidth: '280px',
    },
    name: {
        fontSize: '42px',
        fontWeight: '800',
        color: '#1a202c',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    title: {
        fontSize: '22px',
        color: '#4a5568',
        marginBottom: '16px',
        fontWeight: '500',
    },
    metaInfo: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '24px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#718096',
        fontSize: '15px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    primaryButton: {
        padding: '14px 32px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.3s ease',
    },
    secondaryButton: {
        padding: '14px 32px',
        background: 'transparent',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '50px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    sectionTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    sectionIcon: {
        color: '#667eea',
    },
    aboutText: {
        fontSize: '17px',
        lineHeight: '1.8',
        color: '#4a5568',
    },
    experienceList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
    },
    experienceItem: {
        display: 'flex',
        gap: '20px',
        position: 'relative',
    },
    experienceIconContainer: {
        flexShrink: 0,
    },
    experienceIcon: {
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    experienceContent: {
        flex: 1,
    },
    experienceTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '6px',
    },
    experienceCompany: {
        fontSize: '17px',
        color: '#4a5568',
        marginBottom: '6px',
        fontWeight: '500',
    },
    experiencePeriod: {
        fontSize: '14px',
        color: '#a0aec0',
        marginBottom: '12px',
    },
    experienceDescription: {
        fontSize: '16px',
        color: '#718096',
        lineHeight: '1.6',
    },
    educationItem: {
        display: 'flex',
        gap: '20px',
    },
    educationIconContainer: {
        flexShrink: 0,
    },
    educationIcon: {
        width: '56px',
        height: '56px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)',
    },
    educationDegree: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '6px',
    },
    educationSchool: {
        fontSize: '17px',
        color: '#4a5568',
        marginBottom: '6px',
        fontWeight: '500',
    },
    educationYear: {
        fontSize: '14px',
        color: '#a0aec0',
    },
    skillsGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
    },
    skillBadge: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        color: '#667eea',
        borderRadius: '50px',
        fontSize: '15px',
        fontWeight: '600',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    contactList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '16px',
        color: '#4a5568',
        padding: '12px',
        borderRadius: '12px',
        transition: 'background 0.3s ease',
    },
    contactIcon: {
        color: '#667eea',
    },
};
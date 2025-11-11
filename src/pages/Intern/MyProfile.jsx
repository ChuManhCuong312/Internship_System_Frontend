import React from 'react';
import { MdLocationOn, MdEmail, MdPhone } from 'react-icons/md';
import { FaBriefcase, FaGraduationCap, FaAward, FaUsers, FaLinkedin, FaGithub } from 'react-icons/fa';

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
        <div className="min-h-screen bg-gray-100">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-48"></div>

            <div className="max-w-5xl mx-auto px-4 -mt-32">
                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-md mb-4 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-6xl font-bold border-4 border-white shadow-lg">
                                JD
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">John Doe</h1>
                            <p className="text-xl text-gray-700 mb-2">Senior Software Engineer | Full Stack Developer</p>
                            <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-4">
                                <div className="flex items-center gap-1">
                                    <MdLocationOn size={16} />
                                    <span>San Francisco, CA</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaUsers size={16} />
                                    <span>500+ connections</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
                                    Connect
                                </button>
                                <button className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition">
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white rounded-lg shadow-md mb-4 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Passionate software engineer with 5+ years of experience in building scalable web applications.
                        Specialized in React, Node.js, and cloud technologies. I love solving complex problems and
                        creating intuitive user experiences. Always eager to learn new technologies and share knowledge
                        with the community.
                    </p>
                </div>

                {/* Experience Section */}
                <div className="bg-white rounded-lg shadow-md mb-4 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaBriefcase size={24} />
                        Experience
                    </h2>
                    <div className="space-y-6">
                        {experiences.map((exp, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        <FaBriefcase size={20} className="text-gray-600" />
                                    </div>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                                    <p className="text-gray-700">{exp.company}</p>
                                    <p className="text-sm text-gray-500 mb-2">{exp.period}</p>
                                    <p className="text-gray-600">{exp.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education Section */}
                <div className="bg-white rounded-lg shadow-md mb-4 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaGraduationCap size={24} />
                        Education
                    </h2>
                    {education.map((edu, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <FaGraduationCap size={20} className="text-gray-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                                <p className="text-gray-700">{edu.school}</p>
                                <p className="text-sm text-gray-500">{edu.year}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-lg shadow-md mb-4 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaAward size={24} />
                        Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white rounded-lg shadow-md mb-8 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                            <MdEmail size={20} className="text-blue-600" />
                            <span>john.doe@email.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <MdPhone size={20} className="text-blue-600" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <FaLinkedin size={20} className="text-blue-600" />
                            <span>linkedin.com/in/johndoe</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <FaGithub size={20} className="text-blue-600" />
                            <span>github.com/johndoe</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// frontend/src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './layout'; // Import the Layout component

// Define the structure of the data we expect to receive
interface Subject {
    name: string;
    mastery: number;
}

interface RecommendedTopic {
    name: string;
    status: string;
}

interface DashboardData {
    mastery: {
        mathematics: number;
        physics: number;
        chemistry: number;
    };
    subjects: Subject[];
    recommendedTopics: (string | RecommendedTopic)[];
}

const Dashboard = () => {
    // Initialize state to store the fetched data
    const [data, setData] = useState<DashboardData | null>(null);

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token'); // Get the token from localStorage
            if (!token) return; // If no token is found, stop execution

            try {
                // Make an axios GET request to fetch dashboard data
                const response = await axios.get('http://localhost:4000/dashboard/data', {
                    headers: { Authorization: `Bearer ${token}` }, // Set token in Authorization header
                });

                // Check if response.data matches the expected structure before setting the data
                if (response.data) {
                    setData(response.data as DashboardData); // Ensure the response is typed correctly
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error); // Log any errors
            }
        };

        fetchDashboardData(); // Call the function to fetch the data
    }, []); // Empty dependency array ensures this effect runs once when the component mounts

    // Render loading state while data is being fetched
    if (!data) return <div>Loading...</div>;

    return (
        <Layout>
            <div className="dashboard-container">
                <h1>Dashboard</h1>

                <h2>Overall Mastery</h2>
                <div className="mastery">
                    <p>Mathematics: {data.mastery.mathematics}%</p>
                    <p>Physics: {data.mastery.physics}%</p>
                    <p>Chemistry: {data.mastery.chemistry}%</p>
                </div>

                <h2>Subjects</h2>
                <div className="subjects">
                    {data.subjects.map((subject) => (
                        <div key={subject.name} className="subject-card">
                            <h3>{subject.name}</h3>
                            <p>{subject.mastery}%</p>
                        </div>
                    ))}
                </div>

                <h2>Recommended Topics</h2>
                <ul className="recommended-topics">
                    {data.recommendedTopics.map((topic, index) => {
                        if (typeof topic === 'string') {
                            return <li key={index}>{topic}</li>;
                        }
                        return (
                            <li key={index}>
                                {topic.name} - {topic.status}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Layout>
    );
};

export default Dashboard;

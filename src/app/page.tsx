import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">VCE AI Tutor</h1>
                    <p className="text-gray-600 mt-1">AI-Powered VCE Tutoring Platform</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Welcome to VCE AI Tutor
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Your personalized learning companion for VCE success
                    </p>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Dashboard Card */}
                    <Link href="/dashboard" className="group">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 h-full">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                                Dashboard
                            </h3>
                            <p className="text-gray-600">
                                View your progress, statistics, and personalized learning insights
                            </p>
                        </div>
                    </Link>

                    {/* Practice Card */}
                    <Link href="/practice" className="group">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 h-full">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600">
                                Practice
                            </h3>
                            <p className="text-gray-600">
                                Start practicing with AI-generated questions tailored to your level
                            </p>
                        </div>
                    </Link>

                    {/* Login Card */}
                    <Link href="/auth/signin" className="group">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 h-full">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600">
                                Login
                            </h3>
                            <p className="text-gray-600">
                                Sign in to access your personalized learning experience
                            </p>
                        </div>
                    </Link>

                    {/* Admin Card */}
                    <Link href="/admin" className="group">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 h-full">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-600">
                                Admin
                            </h3>
                            <p className="text-gray-600">
                                Manage users, content, and system settings
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Features Section */}
                <div className="mt-16 bg-white rounded-lg shadow-md p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Why Choose VCE AI Tutor?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🎯</div>
                            <h4 className="font-semibold text-lg mb-2">Personalized Learning</h4>
                            <p className="text-gray-600">AI-powered adaptive questions based on your performance</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">📊</div>
                            <h4 className="font-semibold text-lg mb-2">Track Progress</h4>
                            <p className="text-gray-600">Monitor your improvement with detailed analytics</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">💡</div>
                            <h4 className="font-semibold text-lg mb-2">Instant Feedback</h4>
                            <p className="text-gray-600">Get immediate explanations and learn from mistakes</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white mt-12 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500">
                        © 2025 VCE AI Tutor. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

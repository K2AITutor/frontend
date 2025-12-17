// frontend/src/app/dashboard/layout.tsx

import React from 'react';

type LayoutProps = {
    children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <header>
                <h1>Dashboard</h1>
                {/* Add your navigation or other header elements here */}
            </header>

            <main>
                <section>
                    {/* This will render the children passed to this layout */}
                    {children}
                </section>
            </main>

            <footer>
                <p>Footer content here</p>
            </footer>
        </div>
    );
};

export default Layout;

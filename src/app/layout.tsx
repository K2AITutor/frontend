// frontend/src/app/layout.tsx

import React from 'react';

const Layout: React.FC = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <title>Dashboard</title>
                {/* Add any meta tags, link tags, etc. */}
            </head>
            <body>
                <header>
                    {/* Add your navigation links, logo, etc. */}
                </header>

                <main>{children}</main> {/* This is where your page content will be rendered */}

                <footer>
                    {/* Footer content */}
                    <p>&copy; 2025 Dashboard App. All rights reserved.</p>
                </footer>
            </body>
        </html>
    );
};

export default Layout;

import React from 'react';

const Footer = () => {
  const buildVersion = `v${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

  return (
    <footer className="w-full border-t border-line-100 py-6">
      <div className="container mx-auto px-4">
        <p className="font-mono text-xs text-gray-400">
          © 2026 pikit. All rights reserved. build {buildVersion}
        </p>
      </div>
    </footer>
  );
};

export { Footer };

import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50"
        >
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using TodoApp, you agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. User Accounts</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. User Content</h2>
              <p>You retain ownership of any content you create using TodoApp. You grant us a license to use this content to provide and improve our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Service Modifications</h2>
              <p>We reserve the right to modify or discontinue any part of TodoApp at any time without notice.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
              <p>TodoApp is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of TodoApp after changes constitutes acceptance of new terms.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Terms;
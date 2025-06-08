import React from 'react';
import { motion } from 'framer-motion';

const Cookies = () => {
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
          <h1 className="text-3xl font-bold text-white mb-8">Cookie Policy</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">What Are Cookies</h2>
              <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your experience.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Essential cookies for site functionality</li>
                <li>Authentication and security</li>
                <li>User preferences and settings</li>
                <li>Analytics to improve our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Essential Cookies</h3>
                  <p>Required for basic site functionality and security.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Preference Cookies</h3>
                  <p>Remember your settings and preferences.</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Analytics Cookies</h3>
                  <p>Help us understand how visitors interact with our site.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Managing Cookies</h2>
              <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect site functionality.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Updates to This Policy</h2>
              <p>We may update this Cookie Policy periodically. Please check back regularly for any changes.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Cookies;
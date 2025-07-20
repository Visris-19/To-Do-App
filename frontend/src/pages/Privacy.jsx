    import React from 'react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Cookie Usage</h2>
            <p className="mb-4">
              We use cookies and similar technologies to provide essential functionality:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Authentication and session management</li>
              <li>Security and fraud prevention</li>
              <li>User preferences and settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Data Collection</h2>
            <p className="mb-4">
              We collect and process the following information:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Email address for account creation</li>
              <li>Task data you create and manage</li>
              <li>Usage data to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Data Protection</h2>
            <p>
              We implement appropriate security measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Secure data encryption</li>
              <li>Regular security updates</li>
              <li>Limited data access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Withdraw consent at any time</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <p>
              For any privacy-related questions or concerns, please contact us at:{' '}
              <a href="mailto:privacy@todoapp.com" className="text-blue-400 hover:text-blue-300">
                privacy@todoapp.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-gray-400 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default Privacy
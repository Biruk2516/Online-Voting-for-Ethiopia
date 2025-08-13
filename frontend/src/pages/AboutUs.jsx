import React from 'react';
import { FaVoteYea, FaShieldAlt, FaUserShield, FaChartBar } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About Ethiopian Online Voting System</h1>
          <p className="text-xl text-blue-100">
            Empowering democracy through secure and accessible digital voting
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Statement */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            The Ethiopian Online Voting System is dedicated to modernizing the electoral process in Ethiopia,
            making voting more accessible, secure, and transparent. Our platform leverages cutting-edge
            technology to ensure every eligible citizen can participate in the democratic process,
            regardless of their location.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <FeatureCard
            icon={<FaVoteYea className="text-4xl text-blue-600" />}
            title="Secure Voting"
            description="Advanced encryption and face recognition technology ensure the integrity of every vote."
          />
          <FeatureCard
            icon={<FaShieldAlt className="text-4xl text-green-600" />}
            title="Transparent Process"
            description="Real-time vote tracking and verification systems maintain complete transparency."
          />
          <FeatureCard
            icon={<FaUserShield className="text-4xl text-purple-600" />}
            title="Multi-level Administration"
            description="Hierarchical administration system from national to zone level ensures proper oversight."
          />
          <FeatureCard
            icon={<FaChartBar className="text-4xl text-yellow-600" />}
            title="Real-time Analytics"
            description="Comprehensive analytics and reporting tools for election monitoring."
          />
        </div>

        {/* System Structure */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Structure</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">National Level</h3>
              <p className="text-gray-600">
                National administrators oversee the entire system, ensuring compliance with electoral laws
                and managing regional administrators.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Regional Level</h3>
              <p className="text-gray-600">
                Regional administrators manage elections within their respective regions and coordinate
                with zone administrators.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Zone Level</h3>
              <p className="text-gray-600">
                Zone administrators handle local voter registration, verification, and election management
                within their specific zones.
              </p>
            </div>
          </div>
        </div>

        {/* Security Measures */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Measures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Face Recognition</h3>
              <p className="text-gray-600">
                Advanced face recognition technology ensures that only registered voters can cast their votes.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Encryption</h3>
              <p className="text-gray-600">
                End-to-end encryption protects all voting data and communications within the system.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Audit Trail</h3>
              <p className="text-gray-600">
                Comprehensive audit trails track all system activities for transparency and accountability.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Control</h3>
              <p className="text-gray-600">
                Multi-level access control ensures that only authorized personnel can access sensitive data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default AboutUs;

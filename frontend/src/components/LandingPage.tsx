import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const features = [
  {
    title: "Secure File Sharing",
    description: "Share files securely with time-limited access links and granular permissions.",
    icon: "🔒"
  },
  {
    title: "End-to-End Encryption",
    description: "Your files are encrypted using AES-256 encryption before upload.",
    icon: "🛡️"
  },
  {
    title: "Multi-Factor Authentication",
    description: "Enhanced security with multi-factor authentication support.",
    icon: "🔐"
  },
  {
    title: "Access Control",
    description: "Control who can view or download your files with role-based permissions.",
    icon: "👥"
  }
];

export default function LandingPage() {
const isAuthenticated = useSelector((state: RootState) => state.auth.user);


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Secure File Sharing Made Simple
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Share your files securely with end-to-end encryption, granular access control, and time-limited sharing.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
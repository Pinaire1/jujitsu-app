import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../lib/AuthContext";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendVerificationEmail } = useAuth();

  // Extract email from location state or URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const emailParam =
      queryParams.get("email") || (location.state as any)?.email || "";

    setEmail(emailParam);

    // If token exists in URL, try to verify it
    if (token && emailParam) {
      handleVerification(emailParam, token);
    }
  }, [location]);

  const handleVerification = async (emailToVerify: string, token: string) => {
    try {
      setLoading(true);
      setError(null);
      await verifyOtp(emailToVerify, token);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resendVerificationEmail(email);
      setVerificationSent(true);
    } catch (err: any) {
      console.error("Error sending verification:", err);
      setError(
        err.message || "Failed to send verification email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
          <p className="font-medium">
            Your email has been verified successfully!
          </p>
          <p className="mt-2">Redirecting to login page...</p>
        </div>
      ) : verificationSent ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p>
            Verification email has been sent to <strong>{email}</strong>.
          </p>
          <p className="mt-2">
            Please check your inbox and click on the verification link.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            {email ? (
              <>
                We've sent a verification email to <strong>{email}</strong>.
              </>
            ) : (
              <>Please enter your email to verify your account.</>
            )}
          </p>
          <p className="text-gray-600 mb-6">
            Click the link in the email to verify your account. If you don't see
            the email, check your spam folder.
          </p>

          {!email && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

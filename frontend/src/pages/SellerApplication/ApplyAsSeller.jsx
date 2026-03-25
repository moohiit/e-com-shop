import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  useSubmitSellerApplicationMutation,
  useGetMyApplicationsQuery,
} from "../../features/sellerApplication/sellerApplicationApi";
import { toast } from "react-hot-toast";
import { Loader2, Store, CheckCircle, XCircle, Clock } from "lucide-react";

function ApplyAsSeller() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [submitApplication, { isLoading: submitting }] = useSubmitSellerApplicationMutation();
  const { data: myApps, isLoading: loadingApps } = useGetMyApplicationsQuery(undefined, {
    skip: !user,
  });

  const [form, setForm] = useState({
    businessName: "",
    businessType: "individual",
    businessAddress: "",
    phone: "",
    description: "",
    gstNumber: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitApplication(form).unwrap();
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit application");
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <Store size={48} className="mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Become a Seller</h2>
        <p className="text-gray-600 mb-6">Please log in to apply as a seller on ShopEase.</p>
        <Link
          to="/auth/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login to Apply
        </Link>
      </div>
    );
  }

  if (user.role === "seller") {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4">You're Already a Seller!</h2>
        <p className="text-gray-600 mb-6">You can manage your products from the seller dashboard.</p>
        <Link
          to="/seller/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Seller Dashboard
        </Link>
      </div>
    );
  }

  if (loadingApps) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show existing applications
  const pendingApp = myApps?.applications?.find((a) => a.status === "Pending");
  const latestApp = myApps?.applications?.[0];

  if (pendingApp) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <Clock size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Application Pending</h2>
        <p className="text-gray-600 mb-2">
          Your application for <strong>{pendingApp.businessName}</strong> is under review.
        </p>
        <p className="text-sm text-gray-500">
          Submitted on {new Date(pendingApp.createdAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Store size={40} className="mx-auto text-blue-600 mb-3" />
        <h2 className="text-3xl font-bold">Become a Seller</h2>
        <p className="text-gray-600 mt-2">Fill in your business details to apply</p>
      </div>

      {/* Show previous rejected application */}
      {latestApp?.status === "Rejected" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={18} className="text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-400">Previous application was rejected</span>
          </div>
          {latestApp.adminNote && (
            <p className="text-sm text-red-600 dark:text-red-300">Reason: {latestApp.adminNote}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">You may submit a new application below.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            placeholder="Your business or brand name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Business Type *</label>
          <select
            name="businessType"
            value={form.businessType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Business Address *</label>
          <input
            type="text"
            name="businessAddress"
            value={form.businessAddress}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            placeholder="Full business address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            placeholder="Contact number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Business Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            placeholder="Describe what you sell and your business"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">GST Number (optional)</label>
          <input
            type="text"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            placeholder="GST registration number"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}

export default ApplyAsSeller;

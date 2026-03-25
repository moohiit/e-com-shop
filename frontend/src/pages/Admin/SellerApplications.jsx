import { useState } from "react";
import {
  useGetAllApplicationsQuery,
  useReviewApplicationMutation,
} from "../../features/sellerApplication/sellerApplicationApi";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SellerApplications() {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllApplicationsQuery({ status: filter || undefined, page, limit: 10 });
  const [reviewApplication, { isLoading: reviewing }] = useReviewApplicationMutation();

  const [reviewModal, setReviewModal] = useState(null); // { id, action }
  const [adminNote, setAdminNote] = useState("");

  const handleReview = async () => {
    try {
      await reviewApplication({
        id: reviewModal.id,
        status: reviewModal.action,
        adminNote,
      }).unwrap();
      toast.success(`Application ${reviewModal.action.toLowerCase()} successfully`);
      setReviewModal(null);
      setAdminNote("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to review application");
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case "Approved": return <CheckCircle size={16} className="text-green-500" />;
      case "Rejected": return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const statusBadge = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {statusIcon(status)} {status}
      </span>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Seller Applications</h1>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
      ) : !data?.applications?.length ? (
        <p className="text-gray-500 text-center py-12">No applications found</p>
      ) : (
        <div className="space-y-4">
          {data.applications.map((app) => (
            <div
              key={app._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{app.businessName}</h3>
                    {statusBadge(app.status)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Applicant:</strong> {app.user?.name} ({app.user?.email})</p>
                    <p><strong>Type:</strong> {app.businessType}</p>
                    <p><strong>Address:</strong> {app.businessAddress}</p>
                    <p><strong>Phone:</strong> {app.phone}</p>
                    <p><strong>Description:</strong> {app.description}</p>
                    {app.gstNumber && <p><strong>GST:</strong> {app.gstNumber}</p>}
                    <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                    {app.adminNote && <p><strong>Admin Note:</strong> {app.adminNote}</p>}
                    {app.reviewedAt && (
                      <p><strong>Reviewed:</strong> {new Date(app.reviewedAt).toLocaleDateString()} by {app.reviewedBy?.name || "Admin"}</p>
                    )}
                  </div>
                </div>

                {app.status === "Pending" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setReviewModal({ id: app._id, action: "Approved" })}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setReviewModal({ id: app._id, action: "Rejected" })}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data.pagination?.pages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.pages}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {reviewModal.action === "Approved" ? "Approve" : "Reject"} Application
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {reviewModal.action === "Approved"
                ? "The user's role will be upgraded to Seller."
                : "Please provide a reason for rejection."}
            </p>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={reviewModal.action === "Rejected" ? "Reason for rejection *" : "Optional note to the applicant"}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4"
              required={reviewModal.action === "Rejected"}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setReviewModal(null); setAdminNote(""); }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={reviewing || (reviewModal.action === "Rejected" && !adminNote)}
                className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                  reviewModal.action === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {reviewing ? "Processing..." : `Confirm ${reviewModal.action === "Approved" ? "Approval" : "Rejection"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

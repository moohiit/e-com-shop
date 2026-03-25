import { useState } from "react";
import { useBulkUploadProductsMutation } from "../../features/products/productApiSlice";
import { Upload, Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

function BulkUpload() {
  const [file, setFile] = useState(null);
  const [bulkUpload, { isLoading }] = useBulkUploadProductsMutation();
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    try {
      const res = await bulkUpload(formData).unwrap();
      setResult(res.results);
      toast.success(res.message);
      setFile(null);
    } catch (err) {
      toast.error(err?.data?.message || "Bulk upload failed");
    }
  };

  const handleDownloadTemplate = () => {
    const token = localStorage.getItem("token");
    window.open(`/api/product/bulk-upload/template`, "_blank");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Bulk Upload Products</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Upload a CSV file to create multiple products at once. Download the
          template to see the required format.
        </p>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
        >
          <Download size={16} />
          Download CSV Template
        </button>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="block mx-auto text-sm"
          />
          {file && (
            <p className="text-sm text-green-600 mt-2">
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Uploading...
            </>
          ) : (
            <>
              <Upload size={18} /> Upload Products
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Upload Results</h2>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span>{result.created} created</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              <XCircle size={18} />
              <span>{result.skipped} skipped</span>
            </div>
          </div>

          {result.errors?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-red-600 mb-2">
                Errors:
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-500">
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-3">CSV Format Guide</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>
            <strong>Required columns:</strong> name, description, basePrice,
            stock, categories
          </p>
          <p>
            <strong>Optional columns:</strong> brand, discountPercentage,
            taxPercentage
          </p>
          <p>
            <strong>Categories:</strong> Use pipe (|) to separate multiple
            category names (e.g. "Electronics|Gadgets")
          </p>
          <p>
            <strong>Note:</strong> Products are created without images. You can
            add images later via the edit product page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BulkUpload;

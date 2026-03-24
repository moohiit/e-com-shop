import { useState } from "react";
import {
  useGetSellerReturnsQuery,
  useApproveReturnMutation,
  useRejectReturnMutation,
} from "../../features/returns/returnApiSlice";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const statusColors = {
  Pending: "warning",
  Approved: "info",
  Rejected: "error",
  Refunded: "success",
};

function SellerReturns() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useGetSellerReturnsQuery(statusFilter || undefined);
  const [approveReturn, { isLoading: approving }] = useApproveReturnMutation();
  const [rejectReturn, { isLoading: rejecting }] = useRejectReturnMutation();

  const [actionDialog, setActionDialog] = useState({ open: false, type: null, returnId: null });
  const [sellerNote, setSellerNote] = useState("");

  const handleAction = async () => {
    try {
      if (actionDialog.type === "approve") {
        await approveReturn({ id: actionDialog.returnId, sellerNote }).unwrap();
        toast.success("Return approved and refund processed");
      } else {
        await rejectReturn({ id: actionDialog.returnId, sellerNote }).unwrap();
        toast.success("Return request rejected");
      }
      setActionDialog({ open: false, type: null, returnId: null });
      setSellerNote("");
    } catch (err) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="64vh">
        <CircularProgress />
      </Box>
    );
  }

  const returns = data?.returns || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Return Requests</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
            <MenuItem value="Refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {returns.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          No return requests found.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {returns.map((ret) => (
            <Card key={ret._id} elevation={2}>
              <CardContent>
                <Box display="flex" gap={2} alignItems="flex-start">
                  <Avatar
                    src={ret.product?.images?.[0]?.imageUrl}
                    variant="rounded"
                    sx={{ width: 64, height: 64 }}
                  />
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{ret.itemName}</Typography>
                      <Chip
                        label={ret.status}
                        color={statusColors[ret.status] || "default"}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Order: #{ret.order?._id?.substring(0, 8).toUpperCase()} | Requested:{" "}
                      {format(new Date(ret.createdAt), "MMM dd, yyyy")}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Customer: {ret.user?.name} ({ret.user?.email})
                    </Typography>
                    <Typography variant="body2">
                      Qty: {ret.quantity} | Refund: ₹{ret.refundAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Reason:</strong> {ret.reason}
                    </Typography>
                    {ret.sellerNote && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Your Note:</strong> {ret.sellerNote}
                      </Typography>
                    )}
                    {ret.refundId && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                        Refund ID: {ret.refundId}
                      </Typography>
                    )}

                    {ret.status === "Pending" && (
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() =>
                            setActionDialog({ open: true, type: "approve", returnId: ret._id })
                          }
                        >
                          Approve & Refund
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            setActionDialog({ open: true, type: "reject", returnId: ret._id })
                          }
                        >
                          Reject
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => {
          setActionDialog({ open: false, type: null, returnId: null });
          setSellerNote("");
        }}
      >
        <DialogTitle>
          {actionDialog.type === "approve" ? "Approve Return" : "Reject Return"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {actionDialog.type === "approve"
              ? "Approving will process a refund to the customer automatically."
              : "Please provide a reason for rejecting this return request."}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label={actionDialog.type === "approve" ? "Note (optional)" : "Rejection reason (required)"}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={sellerNote}
            onChange={(e) => setSellerNote(e.target.value)}
            required={actionDialog.type === "reject"}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActionDialog({ open: false, type: null, returnId: null });
              setSellerNote("");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            color={actionDialog.type === "approve" ? "success" : "error"}
            disabled={
              (actionDialog.type === "reject" && !sellerNote) || approving || rejecting
            }
          >
            {approving || rejecting
              ? "Processing..."
              : actionDialog.type === "approve"
              ? "Confirm Approve"
              : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SellerReturns;

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderItemStatusMutation,
  useCancelSellerOrderItemMutation
} from '../../features/order/sellerOrderApi';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function SellerOrderDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetSellerOrderByIdQuery(id);
  const [updateItemStatus, { isLoading: isUpdating }] = useUpdateSellerOrderItemStatusMutation();
  const [cancelItem, { isLoading: isCancelling }] = useCancelSellerOrderItemMutation();
  const [itemStatuses, setItemStatuses] = useState({});
  const [cancelReason, setCancelReason] = useState('');
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const order = data?.order;

  // Status color mapping
  const statusColors = {
    Processing: 'info',
    Shipped: 'warning',
    Delivered: 'success',
    Cancelled: 'error',
    'Partially Delivered': 'success',
    'Partially Shipped': 'warning',
    'Partially Cancelled': 'error'
  };

  // Memoized derived values
  const getOverallStatus = useMemo(() => (items) => {
    if (!items || items.length === 0) return 'Processing';

    const statuses = items.map(item => item.orderStatus);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) return uniqueStatuses[0];

    if (statuses.includes('Cancelled')) return 'Partially Cancelled';
    if (statuses.includes('Delivered')) return 'Partially Delivered';
    if (statuses.includes('Shipped')) return 'Partially Shipped';

    return 'Processing';
  }, []);

  const totalSavings = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => {
      const originalPrice = item.actualPrice || 0;
      const finalPrice = item.price || 0;
      return sum + (originalPrice - finalPrice) * item.quantity;
    }, 0);
  }, [order]);

  useEffect(() => {
    if (order) {
      const initialStatuses = {};
      order.items.forEach(item => {
        initialStatuses[item._id] = item.orderStatus;
      });
      setItemStatuses(initialStatuses);
    }
  }, [order]);

  const handleStatusUpdate = async (itemId, productId) => {
    try {
      await updateItemStatus({ id: order._id, productId, status: itemStatuses[itemId] }).unwrap();
      setSuccessMessage('Item status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update item status');
      console.error('Failed to update item status:', err);
    }
  };

  const handleOpenCancelDialog = (item) => {
    setSelectedItem(item);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
    setSelectedItem(null);
  };

  const handleCancelItem = async () => {
    try {
      await cancelItem({
        id: order._id,
        productId: selectedItem.product,
        reason: cancelReason
      }).unwrap();
      setSuccessMessage('Item cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
      handleCloseCancelDialog();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel item');
      console.error('Failed to cancel item:', err);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="64vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Error: {error?.data?.message || 'Failed to load order details'}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Order Not Found
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/seller/orders"
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const overallStatus = getOverallStatus(order.items);

  return (
    <Box sx={{
      p: isMobile ? 2 : 3,
      maxWidth: 1400,
      margin: '0 auto',
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh'
    }}>
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/seller/orders"
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Order Details
          </Typography>
          <Chip
            label={`Order #${order._id.substring(0, 8).toUpperCase()}`}
            variant="outlined"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              fontWeight: 500
            }}
          />
        </Box>
      </Box>

      {/* Order Summary Card */}
      <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                ₹{order.totalPrice.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Payment Method
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {order.order?.paymentMethod}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order Status
              </Typography>
              <Chip
                label={overallStatus}
                color={statusColors[overallStatus] || 'default'}
                size="medium"
                sx={{ fontWeight: 500 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Buyer and Shipping Info */}
        <Grid item xs={12} md={4}>
          {/* Buyer Information Card */}
          <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Buyer Information
              </Typography>
              <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                <div>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography fontWeight={500}>{order.order?.user?.name}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography fontWeight={500}>{order.order?.user?.email}</Typography>
                </div>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card sx={{ backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Shipping Address
              </Typography>
              <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                <Typography fontWeight={500}>{order.order?.shippingAddress?.fullName}</Typography>
                <Typography>
                  {order.order?.shippingAddress?.flatOrBuilding}, {order.order?.shippingAddress?.locality}
                </Typography>
                <Typography>{order.order?.shippingAddress?.landmark}</Typography>
                <Typography>
                  {order.order?.shippingAddress?.city}, {order.order?.shippingAddress?.state} - {order.order?.shippingAddress?.pincode}
                </Typography>
                <Typography>{order.order?.shippingAddress?.country}</Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography fontWeight={500}>{order.order?.shippingAddress?.mobileNumber}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Order Items and Summary */}
        <Grid item xs={12} md={8}>
          {/* Order Items Card */}
          <Card sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Items ({order.items.length})
              </Typography>
              <List>
                {order.items.map((item) => {
                  const availableStatusOptions = ['Processing', 'Shipped', 'Delivered'].filter(
                    opt => opt !== item.orderStatus && !item.isCancelled
                  );

                  return (
                    <React.Fragment key={item._id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: 2,
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            variant="rounded"
                            src={item.product?.images?.[0]?.imageUrl}
                            sx={{
                              width: 80,
                              height: 80,
                              mr: 2,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {!item.product?.images?.[0]?.imageUrl && 'No Image'}
                          </Avatar>
                        </ListItemAvatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Brand: {item.product?.brand}
                          </Typography>
                          <Box mt={1}>
                            <Typography variant="body2">
                              Base Price: ₹{(item.actualPrice * item.quantity).toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                              Taxes ({item.taxPercentage}%): ₹{(item.taxes * item.quantity).toFixed(2)}
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              Total Price: ₹{(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mt={1}>
                            <Chip
                              label={item.orderStatus}
                              color={statusColors[item.orderStatus] || 'default'}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                            {item.isDelivered && item.deliveredAt && (
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                on {format(new Date(item.deliveredAt), 'MMM dd, yyyy')}
                              </Typography>
                            )}
                            {item.isCancelled && item.cancelledAt && (
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                on {format(new Date(item.cancelledAt), 'MMM dd, yyyy')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{
                          minWidth: isMobile ? '100%' : 200,
                          textAlign: isMobile ? 'left' : 'right',
                          mt: isMobile ? 2 : 0,
                          pl: isMobile ? 9 : 0
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ my: 1 }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          {!item.isCancelled && (
                            <Box sx={{
                              display: 'flex',
                              flexDirection: isMobile ? 'column' : 'column',
                              gap: 1
                            }}>
                              <Select
                                value={itemStatuses[item._id] || item.orderStatus}
                                onChange={(e) => setItemStatuses({ ...itemStatuses, [item._id]: e.target.value })}
                                size="small"
                                sx={{
                                  minWidth: 120,
                                  backgroundColor: theme.palette.background.paper
                                }}
                                disabled={isUpdating || availableStatusOptions.length === 0}
                              >
                                {availableStatusOptions.map((s) => (
                                  <MenuItem key={s} value={s}>{s}</MenuItem>
                                ))}
                              </Select>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleStatusUpdate(item._id, item.product?._id)}
                                disabled={isUpdating || itemStatuses[item._id] === item.orderStatus || availableStatusOptions.length === 0}
                                sx={{ textTransform: 'none' }}
                              >
                                {isUpdating ? 'Updating...' : 'Update Status'}
                              </Button>
                              {!item.isDelivered && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleOpenCancelDialog(item)}
                                  sx={{ textTransform: 'none' }}
                                >
                                  Cancel Item
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card sx={{ backgroundColor: theme.palette.background.paper }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Price Summary
              </Typography>
              <Box sx={{ '& > *:not(:last-child)': { mb: 1.5 } }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Items Price</Typography>
                  <Typography>₹{order.itemsPrice.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Tax</Typography>
                  <Typography>₹{order.taxPrice?.toFixed(2)}</Typography>
                </Box>
                {totalSavings > 0 && (
                  <Box display="flex" justifyContent="space-between" color="success.main">
                    <Typography>Discount Savings</Typography>
                    <Typography>-₹{totalSavings.toFixed(2)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between" fontWeight="bold">
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="subtitle1">₹{order.totalPrice.toFixed(2)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Item Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Cancel Item</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel the following item?
          </Typography>
          <Typography variant="subtitle1" gutterBottom fontWeight={500}>
            {selectedItem?.name}
          </Typography>
          <Box sx={{ '& > *:not(:last-child)': { mb: 0.5 } }}>
            <Typography>Quantity: {selectedItem?.quantity}</Typography>
            <Typography>Base Price: ₹{(selectedItem?.actualPrice * selectedItem?.quantity).toFixed(2)}</Typography>
            <Typography>Taxes ({selectedItem?.taxPercentage}%): ₹{(selectedItem?.taxes * selectedItem?.quantity).toFixed(2)}</Typography>
            <Typography fontWeight={500}>Total Price: ₹{(selectedItem?.price * selectedItem?.quantity).toFixed(2)}</Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for cancellation"
            type="text"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Close</Button>
          <Button
            onClick={handleCancelItem}
            color="error"
            disabled={!cancelReason || isCancelling}
            variant="contained"
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SellerOrderDetails;
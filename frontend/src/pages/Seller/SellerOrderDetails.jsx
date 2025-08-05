import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderStatusMutation,
  useCancelSellerOrderMutation
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
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert
} from '@mui/material';
import { format } from 'date-fns';

function SellerOrderDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetSellerOrderByIdQuery(id);
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateSellerOrderStatusMutation();
  const [cancelSellerOrder, { isLoading: isCancelling }] = useCancelSellerOrderMutation();
  const [status, setStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const order = data?.order;

  // Status color mapping
  const statusColors = {
    Processing: 'info',
    Shipped: 'warning',
    Delivered: 'success',
    Cancelled: 'error'
  };

  // Memoized derived values
  const isOrderCancelled = useMemo(() => order?.orderStatus === 'Cancelled', [order]);
  const canCancel = useMemo(() =>
    !isOrderCancelled && order?.orderStatus !== 'Delivered',
    [isOrderCancelled, order]
  );

  const availableStatusOptions = useMemo(() => {
    if (isOrderCancelled) return [];
    return ['Processing', 'Shipped', 'Delivered'].filter(opt =>
      opt !== order?.orderStatus
    );
  }, [isOrderCancelled, order]);

  // Calculate total savings from discounts
  const totalSavings = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => {
      const originalPrice = item.product?.price || 0;
      const discountedPrice = item.price || 0;
      return sum + (originalPrice - discountedPrice) * item.quantity;
    }, 0);
  }, [order]);

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus({ id: order._id, status }).unwrap();
      setSuccessMessage('Order status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
  };

  const handleCancelOrder = async () => {
    try {
      await cancelSellerOrder({
        id: order._id,
        reason: cancelReason
      }).unwrap();
      setSuccessMessage('Order cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      refetch();
      handleCloseCancelDialog();
    } catch (err) {
      console.error('Failed to cancel order:', err);
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
      <Typography color="error" align="center" mt={4}>
        Error: {error?.data?.message || 'Failed to load order details'}
      </Typography>
    );
  }

  if (!order) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          Order Not Found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Order Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Order ID: {order._id}
        </Typography>
      </Box>

      {/* Order Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Order Date
              </Typography>
              <Typography variant="body1">
                {format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body1">
                ₹{order.totalPrice.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1">
                {order.order?.paymentMethod}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Order Status
              </Typography>
              <Chip
                label={order.orderStatus}
                color={statusColors[order.orderStatus] || 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>

        {/* Status Update Section - Only show if order isn't cancelled */}
        {!isOrderCancelled && (
          <Paper elevation={0} sx={{ bgcolor: 'background.default', p: 2 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Update Order Status
                </Typography>
                <Box display="flex" gap={2} alignItems="center">
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    size="small"
                    sx={{ minWidth: 180 }}
                    disabled={isUpdating || availableStatusOptions.length === 0}
                  >
                    {availableStatusOptions.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="contained"
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || status === order.orderStatus || availableStatusOptions.length === 0}
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </Button>
                  {canCancel && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleOpenCancelDialog}
                    >
                      Cancel Order
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6} textAlign={{ md: 'right' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {format(new Date(order.updatedAt), 'dd MMM yyyy, h:mm a')}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Buyer and Shipping Info */}
        <Grid item xs={12} md={4}>
          {/* Buyer Information Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Buyer Information
              </Typography>
              <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                <div>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography>{order.order?.user?.name}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{order.order?.user?.email}</Typography>
                </div>
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                <Typography fontWeight="medium">{order.order?.shippingAddress?.fullName}</Typography>
                <Typography>
                  {order.order?.shippingAddress?.flatOrBuilding}, {order.order?.shippingAddress?.locality}
                </Typography>
                <Typography>{order.order?.shippingAddress?.landmark}</Typography>
                <Typography>
                  {order.order?.shippingAddress?.city}, {order.order?.shippingAddress?.state} - {order.order?.shippingAddress?.pincode}
                </Typography>
                <Typography>{order.order?.shippingAddress?.country}</Typography>
                <Box mt={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography>{order.order?.shippingAddress?.mobileNumber}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Order Items and Summary */}
        <Grid item xs={12} md={8}>
          {/* Order Items Card */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items ({order.items.length})
              </Typography>
              <List>
                {order.items.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={item.product?.images?.[0]?.imageUrl}
                          sx={{ width: 80, height: 80, mr: 2 }}
                        >
                          {!item.product?.images?.[0]?.imageUrl && 'No Image'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            <Box component="span" display="block" color="text.secondary">
                              Brand: {item.product?.brand}
                            </Box>
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <Box component="span">
                                ₹{item.price.toFixed(2)}
                              </Box>
                              {item.product?.price > item.price && (
                                <Box component="span" color="text.secondary" sx={{ ml: 1, textDecoration: 'line-through' }}>
                                  ₹{item.product.price.toFixed(2)}
                                </Box>
                              )}
                            </Box>
                          </>
                        }
                      />
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">
                          Qty: {item.quantity}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Items Price</Typography>
                  <Typography>₹{order.itemsPrice.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Shipping</Typography>
                  <Typography>₹{order.shippingPrice.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Tax</Typography>
                  <Typography>₹{order.taxPrice.toFixed(2)}</Typography>
                </Box>
                {totalSavings > 0 && (
                  <Box display="flex" justifyContent="space-between" color="success.main">
                    <Typography>Discount Savings</Typography>
                    <Typography>-₹{totalSavings.toFixed(2)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" fontWeight="bold">
                  <Typography>Total</Typography>
                  <Typography>₹{order.totalPrice.toFixed(2)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cancel Order Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this order?
          </Typography>
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
          <Button onClick={handleCloseCancelDialog}>Cancel</Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            disabled={!cancelReason || isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SellerOrderDetails;
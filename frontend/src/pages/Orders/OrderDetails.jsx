import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetOrderByIdQuery,
  useCancelOrderItemMutation
} from '../../features/order/orderApi';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-hot-toast';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetOrderByIdQuery(id);
  const [cancelOrderItem, { isLoading: isCancelling }] = useCancelOrderItemMutation();
  const [cancelReason, setCancelReason] = useState('');
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const order = data?.order;
  const theme = useTheme();

  const handleOpenCancelDialog = (item) => {
    setSelectedItem(item);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
    setSelectedItem(null);
  };

  const handleCancelOrderItem = async () => {
    try {
      await cancelOrderItem({
        id: order._id,
        productId: selectedItem.product._id,
        reason: cancelReason
      }).unwrap();
      handleCloseCancelDialog();
      toast.success('Item cancelled successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to cancel item');
      console.error('Failed to cancel item:', err);
    }
  };

  const getOverallStatus = (items) => {
    if (!items || items.length === 0) return 'Processing';

    const statuses = items.map(item => item.orderStatus);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) return uniqueStatuses[0];

    if (statuses.includes('Cancelled')) return 'Partially Cancelled';
    if (statuses.includes('Delivered')) return 'Partially Delivered';
    if (statuses.includes('Shipped')) return 'Partially Shipped';

    return 'Processing';
  };

  const statusColors = {
    Processing: 'info',
    Shipped: 'warning',
    Delivered: 'success',
    Cancelled: 'error',
    'Partially Delivered': 'success',
    'Partially Shipped': 'warning',
    'Partially Cancelled': 'error',
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
          Order not found
        </Typography>
        <Button
          component={Link}
          to="/my-orders"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const totalSavings = order.orderItems.reduce((sum, item) => {
    const originalPrice = item.product?.actualPrice || item.actualPrice || 0;
    const finalPrice = item.price || 0;
    return sum + (originalPrice - finalPrice) * item.quantity;
  }, 0);

  return (
    <Box sx={{
      p: 3,
      maxWidth: 1200,
      margin: '0 auto',
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Order Details
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          #{order._id.substring(0, 8).toUpperCase()}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Order Summary and Shipping */}
        <Grid item xs={12} md={5}>
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Order Date:</Typography>
                <Typography>{format(new Date(order.createdAt), 'MMMM do, yyyy')}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Payment Method:</Typography>
                <Typography>{order.paymentMethod}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Payment Status:</Typography>
                <Chip
                  label={order.isPaid ? 'Paid' : 'Pending'}
                  color={order.isPaid ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
              {order.isPaid && (
                <Box display="flex" justifyContent="space-between">
                  <Typography>Paid On:</Typography>
                  <Typography>{format(new Date(order.paidAt), 'MMMM do, yyyy')}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography fontWeight="medium">{order.shippingAddress.fullName}</Typography>
              <Typography>
                {order.shippingAddress.flatOrBuilding}, {order.shippingAddress.locality}
              </Typography>
              <Typography>{order.shippingAddress.landmark}</Typography>
              <Typography>
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </Typography>
              <Typography>{order.shippingAddress.country}</Typography>
              <Box mt={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact
                </Typography>
                <Typography>{order.shippingAddress.mobileNumber}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Order Items and Status */}
        <Grid item xs={12} md={7}>
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items ({order.orderItems.length})
              </Typography>
              <List>
                {order.orderItems.map((item) => (
                  <React.Fragment key={item._id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.product?.images?.[0]?.imageUrl}
                          variant="rounded"
                          sx={{ width: 80, height: 80, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <Box component="div" sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" component="div">
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {item.product?.brand}
                        </Typography>
                        <Box component="div" mt={0.5}>
                          <Typography variant="body2" component="div">
                            Base Price: ₹{(item.actualPrice * item.quantity).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" component="div">
                            Taxes ({item.taxPercentage}%): ₹{(item.taxes * item.quantity).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" component="div">
                            Total Price: ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mt={1}>
                          <Chip
                            label={item.orderStatus}
                            color={statusColors[item.orderStatus] || 'default'}
                            size="small"
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
                      <Box sx={{ minWidth: 150, textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Qty: {item.quantity}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        {!item.isCancelled && !item.isDelivered && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={() => handleOpenCancelDialog(item)}
                          >
                            Cancel Item
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seller Order Statuses
              </Typography>

              {order.sellerOrders?.map((sellerOrder) => {
                const overallStatus = getOverallStatus(sellerOrder.items);

                return (
                  <Accordion key={sellerOrder._id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Typography sx={{ flex: 1 }}>
                          Seller: {sellerOrder.seller?.name || 'Unknown Seller'}
                        </Typography>
                        <Chip
                          label={overallStatus}
                          color={statusColors[overallStatus] || 'default'}
                          size="small"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Items from this seller:</Typography>
                        <List dense>
                          {sellerOrder.items.map((item) => (
                            <ListItem key={item._id}>
                              <Box component="div" sx={{ flexGrow: 1 }}>
                                <Typography variant="body1" component="div">
                                  {item.name} (Qty: {item.quantity})
                                </Typography>
                                <Typography variant="body2" component="div">
                                  Base Price: ₹{(item.actualPrice * item.quantity).toFixed(2)}
                                </Typography>
                                <Typography variant="body2" component="div">
                                  Taxes ({item.taxPercentage}%): ₹{(item.taxes * item.quantity).toFixed(2)}
                                </Typography>
                                <Typography variant="body2" component="div">
                                  Total Price: ₹{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                                <Box display="flex" alignItems="center" mt={0.5}>
                                  <Chip
                                    label={item.orderStatus}
                                    color={statusColors[item.orderStatus] || 'default'}
                                    size="small"
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
                              <Box sx={{ minWidth: 150, textAlign: 'right' }}>
                                <Typography variant="body1" fontWeight="medium">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="subtitle2">Subtotal:</Typography>
                        <Typography>₹{sellerOrder.totalPrice.toFixed(2)}</Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Price Summary
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

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          component={Link}
          to="/my-orders"
          variant="contained"
          color="primary"
        >
          Back to Orders
        </Button>
      </Box>

      {/* Cancel Item Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>Cancel Item</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel the following item?
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {selectedItem?.name}
          </Typography>
          <Typography component="div">Quantity: {selectedItem?.quantity}</Typography>
          <Typography component="div">Price: ₹{(selectedItem?.price * selectedItem?.quantity).toFixed(2)}</Typography>
          <Typography component="div">Base Price: ₹{(selectedItem?.actualPrice * selectedItem?.quantity).toFixed(2)}</Typography>
          <Typography component="div">Taxes ({selectedItem?.taxPercentage}%): ₹{(selectedItem?.taxes * selectedItem?.quantity).toFixed(2)}</Typography>
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
            onClick={handleCancelOrderItem}
            color="error"
            disabled={!cancelReason || isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrderDetails;
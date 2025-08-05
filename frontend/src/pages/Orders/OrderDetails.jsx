import React, { use, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useGetOrderByIdQuery, 
  useCancelOrderMutation 
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
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
function OrderDetails() {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetOrderByIdQuery(id);
  const [cancelSellerOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [cancelReason, setCancelReason] = useState('');
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedSellerOrder, setSelectedSellerOrder] = useState(null);
  const order = data?.order;
  const navigate = useNavigate();

  const handleOpenCancelDialog = (sellerOrder) => {
    setSelectedSellerOrder(sellerOrder);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelReason('');
    setSelectedSellerOrder(null);
  };

  const handleCancelOrder = async () => {
    try {
      await cancelSellerOrder({
        id: selectedSellerOrder._id,
        reason: cancelReason
      }).unwrap();
      handleCloseCancelDialog();
      setCancelReason('');
      navigate('/my-orders');
    } catch (err) {
      console.error('Failed to cancel seller order:', err);
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

  // Status color mapping
  const statusColors = {
    Processing: 'info',
    Shipped: 'warning',
    Delivered: 'success',
    Cancelled: 'error'
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
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
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            <Box component="span" display="block" color="text.secondary">
                              {item.product?.brand}
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

          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seller Order Statuses
              </Typography>
              
              {order.sellerOrders?.map((sellerOrder) => {
                const canCancelSellerOrder = sellerOrder.orderStatus !== 'Delivered' && 
                                              sellerOrder.orderStatus !== 'Cancelled';
                
                return (
                  <Accordion key={sellerOrder._id} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Typography sx={{ flex: 1 }}>
                          Seller: {sellerOrder.seller?.name || 'Unknown Seller'}
                        </Typography>
                        <Chip 
                          label={sellerOrder.orderStatus} 
                          color={statusColors[sellerOrder.orderStatus] || 'default'} 
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
                              <ListItemText
                                primary={`${item.name} (Qty: ${item.quantity})`}
                                secondary={`₹${item.price.toFixed(2)} each`}
                              />
                              <Typography>₹{(item.price * item.quantity).toFixed(2)}</Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2">Order Status:</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={sellerOrder.orderStatus} 
                            color={statusColors[sellerOrder.orderStatus] || 'default'} 
                            size="small" 
                          />
                          {sellerOrder.deliveredAt && (
                            <Typography variant="body2" color="text.secondary">
                              Delivered on {format(new Date(sellerOrder.deliveredAt), 'MMM dd, yyyy')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={1}>
                        <Typography variant="subtitle2">Subtotal:</Typography>
                        <Typography>₹{sellerOrder.totalPrice.toFixed(2)}</Typography>
                      </Box>
                      {canCancelSellerOrder && (
                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button 
                            variant="outlined" 
                            color="error"
                            size="small"
                            onClick={() => handleOpenCancelDialog(sellerOrder)}
                          >
                            Cancel This Seller Order
                          </Button>
                        </Box>
                      )}
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

      {/* Cancel Order Dialog */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog}>
        <DialogTitle>
          Cancel Seller Order ({selectedSellerOrder?.seller?.name || 'Unknown Seller'})
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to cancel items from this seller:
          </Typography>
          <List dense>
            {selectedSellerOrder?.items.map((item) => (
              <ListItem key={item._id}>
                <ListItemText
                  primary={`${item.name} (Qty: ${item.quantity})`}
                  secondary={`₹${item.price.toFixed(2)} each`}
                />
              </ListItem>
            ))}
          </List>
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
            {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrderDetails;
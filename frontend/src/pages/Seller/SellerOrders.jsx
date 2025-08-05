import React, { useState } from 'react';
import { useGetSellerOrdersQuery } from '../../features/order/sellerOrderApi';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
  Pagination,
  Stack,
  Divider,
  Card,
  CardContent,
  CardActions,
  Badge
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Status color mapping
const statusColors = {
  Processing: 'info',
  Shipped: 'warning',
  Delivered: 'success',
  Cancelled: 'error'
};

function SellerOrders() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useGetSellerOrdersQuery({ page });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  const handlePageChange = (event, value) => {
    setPage(value);
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
        Error: {error?.data?.message || 'Failed to load seller orders'}
      </Typography>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          No Orders Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You haven't received any orders yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Seller Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order._id}>
            <Card elevation={3}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" component="div">
                    Order #{order._id.substring(0, 8).toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a')}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Buyer Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {order.order?.user?.name || 'Unknown'}
                    </Typography>
                    {order.order?.shippingAddress && (
                      <>
                        <Typography variant="body2">
                          <strong>Address:</strong> {order.order.shippingAddress.flatOrBuilding}, {order.order.shippingAddress.locality}
                        </Typography>
                        <Typography variant="body2">
                          <strong>City:</strong> {order.order.shippingAddress.city}, {order.order.shippingAddress.state} - {order.order.shippingAddress.pincode}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Contact:</strong> {order.order.shippingAddress.mobileNumber}
                        </Typography>
                      </>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Order Summary
                    </Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        <strong>Status:</strong>
                      </Typography>
                      <Chip
                        label={order.orderStatus}
                        size="small"
                        color={statusColors[order.orderStatus] || 'default'}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">
                        <strong>Payment:</strong>
                      </Typography>
                      <Chip
                        label={order.order?.isPaid ? 'Paid' : 'Pending'}
                        size="small"
                        color={order.order?.isPaid ? 'success' : 'error'}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        <strong>Method:</strong>
                      </Typography>
                      <Typography variant="body2">
                        {order.order?.paymentMethod}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        <strong>Total:</strong>
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{order.order?.totalPrice?.toFixed(2)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Products ({order.items.length})
                </Typography>
                <List dense>
                  {order.items.map((item) => (
                    <ListItem
                      key={item._id}
                      sx={{
                        py: 1,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        '&:last-child': { borderBottom: 'none' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={item.product?.images?.[0]?.imageUrl}
                          variant="rounded"
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product?.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" display="block">
                              ₹{(item.product?.discountPrice || item.product?.price)?.toFixed(2)} × {item.quantity}
                            </Typography>
                            {item.product?.brand && (
                              <Typography component="span" variant="caption" display="block">
                                Brand: {item.product.brand}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Typography variant="body2" fontWeight="bold">
                        ₹{((item.product?.discountPrice || item.product?.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                  component={Link}
                  to={`/seller/order/${order._id}`}
                  variant="contained"
                  size="small"
                  color="primary"
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}

export default SellerOrders;
import React, { useState } from 'react';
import { useGetMyOrdersQuery } from '../../features/order/orderApi';
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
  Pagination,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

function Orders() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useGetMyOrdersQuery({ page });

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
        Error: {error?.data?.message || 'Failed to load orders'}
      </Typography>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          You have no orders yet
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
        {orders.map((order) => (
          <Card key={order._id} elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" component="h2">
                  Order #{order._id.substring(0, 8).toUpperCase()}
                </Typography>
                <Box display="flex" gap={2}>
                  <Chip
                    label={order.isPaid ? 'Paid' : 'Pending'}
                    color={order.isPaid ? 'success' : 'warning'}
                    size="small"
                  />
                  <Chip
                    label={order.orderStatus}
                    color={
                      order.orderStatus === 'Delivered' ? 'success' :
                        order.orderStatus === 'Cancelled' ? 'error' :
                          order.orderStatus === 'Shipped' ? 'warning' : 'info'
                    }
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                {format(new Date(order.createdAt), 'MMMM do, yyyy - h:mm a')}
              </Typography>

              <List dense>
                {order.orderItems.slice(0, 2).map((item) => (
                  <ListItem key={item._id} disablePadding>
                    <ListItemAvatar>
                      <Avatar
                        src={item.product?.images?.[0]?.imageUrl}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} × ₹${item.price.toFixed(2)}`}
                    />
                  </ListItem>
                ))}
                {order.orderItems.length > 2 && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 8 }}>
                    +{order.orderItems.length - 2} more items
                  </Typography>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  ₹{order.totalPrice.toFixed(2)}
                </Typography>
                <Button
                  component={Link}
                  to={`/order/${order._id}`}
                  variant="outlined"
                  size="small"
                >
                  View Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {totalPages > 1 && (
        <Stack spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            sx={{ mt: 3 }}
          />
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export default Orders;
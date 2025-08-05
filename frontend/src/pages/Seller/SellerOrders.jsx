import React from 'react';
import { useGetSellerOrdersQuery } from '../../features/order/sellerOrderApi';
import { 
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
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
  const { data, isLoading, isError, error } = useGetSellerOrdersQuery();
  const orders = data?.orders || [];
  console.log('Seller Orders:', orders);

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
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Seller Orders
      </Typography>

      <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Buyer</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order._id} 
                  hover 
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ maxWidth: 150 }}>
                    <Typography variant="body2" noWrap>
                      {order._id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(order.createdAt), 'MMM dd')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {order.order?.user?.name || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <List dense disablePadding>
                      {order.items.map((item) => (
                        <ListItem key={item._id} disablePadding sx={{ py: 0.5 }}>
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar 
                              src={item.product?.images?.[0]?.imageUrl} 
                              variant="rounded"
                              sx={{ width: 32, height: 32 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${item.product?.name} x ${item.quantity}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      ₹{order.order?.totalPrice?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.order?.paymentMethod}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <Chip 
                      label={order.order?.isPaid ? 'Paid' : 'Pending'}
                      size="small"
                      color={order.order?.isPaid ? 'success' : 'error'}
                    />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.orderStatus} 
                      size="small"
                      color={statusColors[order.orderStatus] || 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/seller/order/${order._id}`}
                      variant="outlined"
                      size="small"
                      color="primary"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default SellerOrders;
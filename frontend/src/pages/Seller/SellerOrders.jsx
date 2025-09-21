import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSellerOrdersQuery } from '../../features/order/sellerOrderApi';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Pagination,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
  Grid,
  Skeleton
} from '@mui/material';
import { format } from 'date-fns';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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

function SellerOrders() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useGetSellerOrdersQuery({ page });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  const handlePageChange = (event, value) => {
    setPage(value);
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

  if (isLoading) {
    return (
      <Box sx={{
        p: isMobile ? 2 : 3,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <Typography variant="h4" sx={{
          mb: 3,
          fontWeight: 600,
          color: theme.palette.text.primary
        }}>
          Seller Orders
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Card sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1]
              }}>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="30%" height={30} sx={{ mt: 1 }} />
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="70%" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="70%" />
                    </Grid>
                  </Grid>
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Skeleton variant="rectangular" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{
        p: 3,
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <Typography variant="h6" sx={{
          color: theme.palette.error.main,
          mb: 2
        }}>
          Error: {error?.data?.message || 'Failed to load seller orders'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box sx={{
        p: 3,
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        <Typography variant="h4" sx={{
          mb: 2,
          fontWeight: 600,
          color: theme.palette.text.primary
        }}>
          No Orders Found
        </Typography>
        <Typography variant="body1" sx={{
          mb: 3,
          color: theme.palette.text.secondary
        }}>
          You haven't received any orders yet.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/seller/dashboard"
        >
          Go to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: isMobile ? 2 : 3,
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default
    }}>
      <Typography variant="h4" sx={{
        mb: 3,
        fontWeight: 600,
        color: theme.palette.text.primary
      }}>
        Seller Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => {
          const overallStatus = getOverallStatus(order.items);

          return (
            <Grid item xs={12} key={order._id}>
              <Card sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}>
                <CardContent>
                  <Stack
                    direction={isMobile ? 'column' : 'row'}
                    justifyContent="space-between"
                    alignItems={isMobile ? 'flex-start' : 'center'}
                    spacing={1}
                    mb={2}
                  >
                    <Typography variant="h6" sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}>
                      Order #{order._id.substring(0, 8).toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: theme.palette.text.secondary
                    }}>
                      {format(new Date(order.createdAt), 'MMM dd, yyyy - hh:mm a')}
                    </Typography>
                  </Stack>

                  <Divider sx={{
                    my: 2,
                    backgroundColor: theme.palette.divider
                  }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: theme.palette.text.primary
                      }}>
                        Buyer Information
                      </Typography>
                      <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                          <Box component="span" sx={{ fontWeight: 500 }}>Name:</Box> {order.order?.user?.name || 'Unknown'}
                        </Typography>
                        {order.order?.shippingAddress && (
                          <>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                              <Box component="span" sx={{ fontWeight: 500 }}>Address:</Box> {order.order.shippingAddress.flatOrBuilding}, {order.order.shippingAddress.locality}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                              <Box component="span" sx={{ fontWeight: 500 }}>City:</Box> {order.order.shippingAddress.city}, {order.order.shippingAddress.state} - {order.order.shippingAddress.pincode}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                              <Box component="span" sx={{ fontWeight: 500 }}>Contact:</Box> {order.order.shippingAddress.mobileNumber}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: theme.palette.text.primary
                      }}>
                        Order Summary
                      </Typography>
                      <Box sx={{ '& > *:not(:last-child)': { mb: 1 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>Status:</Box>
                          </Typography>
                          <Chip
                            label={overallStatus}
                            size="small"
                            color={statusColors[overallStatus] || 'default'}
                            sx={{ fontWeight: 500 }}
                          />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>Payment:</Box>
                          </Typography>
                          <Chip
                            label={order.order?.isPaid ? 'Paid' : 'Pending'}
                            size="small"
                            color={order.order?.isPaid ? 'success' : 'error'}
                          />
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>Method:</Box>
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            {order.order?.paymentMethod}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            <Box component="span" sx={{ fontWeight: 500 }}>Total:</Box>
                          </Typography>
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary
                          }}>
                            ₹{order.totalPrice.toFixed(2)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{
                    my: 2,
                    backgroundColor: theme.palette.divider
                  }} />

                  <Typography variant="subtitle1" sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: theme.palette.text.primary
                  }}>
                    Products ({order.items.length})
                  </Typography>
                  <List dense>
                    {order.items.slice(0, 1).map((item) => (
                      <ListItem
                        key={item._id}
                        sx={{
                          py: 1,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={item.product?.images?.[0]?.imageUrl}
                            variant="rounded"
                            sx={{
                              width: 56,
                              height: 56,
                              mr: 2,
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography sx={{
                              fontWeight: 500,
                              color: theme.palette.text.primary
                            }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Box component="div">
                              <Typography component="div" variant="body2" sx={{
                                color: theme.palette.text.secondary
                              }}>
                                ₹{item.price.toFixed(2)} × {item.quantity}
                              </Typography>
                              {item.product?.brand && (
                                <Typography component="div" variant="caption" sx={{
                                  display: 'block',
                                  color: theme.palette.text.secondary
                                }}>
                                  Brand: {item.product.brand}
                                </Typography>
                              )}
                              <Box component="div" sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 0.5
                              }}>
                                <Chip
                                  label={item.orderStatus}
                                  size="small"
                                  color={statusColors[item.orderStatus] || 'default'}
                                  sx={{ fontWeight: 500 }}
                                />
                                {item.isDelivered && item.deliveredAt && (
                                  <Typography component="span" variant="body2" sx={{
                                    ml: 1,
                                    color: theme.palette.text.secondary
                                  }}>
                                    on {format(new Date(item.delervedAt), 'MMM dd, yyyy')}
                                  </Typography>
                                )}
                                {item.isCancelled && item.cancelledAt && (
                                  <Typography component="span" variant="body2" sx={{
                                    ml: 1,
                                    color: theme.palette.text.secondary
                                  }}>
                                    on {format(new Date(item.cancelledAt), 'MMM dd, yyyy')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <Typography sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary
                        }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                    {order.items.length > 1 && (
                      <Typography variant="body2" sx={{
                        mt: 1,
                        color: theme.palette.text.secondary
                      }}>
                        +{order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''}
                      </Typography>
                    )}
                  </List>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    component={Link}
                    to={`/seller/order/${order._id}`}
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.palette.text.primary
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default SellerOrders;
import React from 'react'
import { useSelector } from 'react-redux'
import AccessDenied from '../../components/common/AccessDenied'

function Cart() {
  const { user } = useSelector(state => state.auth)
  if (user?.role === 'seller' || user?.role === 'admin') {
    return <AccessDenied/>
  }
  return (
    <div>Cart</div>
  )
}

export default Cart
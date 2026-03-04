import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../../config/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminFetch(
        `/api/admin/transactions?page=${currentPage}&status=${filterStatus}&method=${filterMethod}&search=${searchTerm}`
      );
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.totalPages);
        setTotalRevenue(data.totalRevenue || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus, filterMethod, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleTransactionAction = async (transactionId, action) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/${action}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh transactions list
        fetchTransactions();
      }
    } catch (error) {
      console.error(`Error ${action} transaction:`, error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'pending': return 'pending';
      case 'failed': return 'failed';
      case 'cancelled': return 'cancelled';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="admin-transactions">
      <div className="page-header">
        <h1>Transaction Management</h1>
        <p>Monitor and manage all payment transactions</p>
      </div>

      {/* Revenue Summary */}
      <div className="revenue-summary">
        <div className="revenue-card">
          <h3>Total Revenue</h3>
          <p className="revenue-amount">₦{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by reference or event title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="method-filter"
          >
            <option value="all">All Methods</option>
            <option value="paystack">Paystack</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>User</th>
              <th>Event</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="transaction-info">
                  <div className="transaction-id">
                    <p className="reference">{transaction.reference}</p>
                    <p className="transaction-id-short">ID: {transaction._id.slice(-8)}</p>
                  </div>
                </td>
                <td>
                  <div className="user-info">
                    <p className="user-name">
                      {transaction.user?.name || transaction.user?.email || 'Unknown'}
                    </p>
                    <p className="user-role">{transaction.user?.role || 'User'}</p>
                  </div>
                </td>
                <td>
                  <div className="event-info">
                    <p className="event-title">
                      {transaction.metadata?.eventTitle || 'Unknown Event'}
                    </p>
                    <p className="ticket-count">
                      {transaction.ticketCount} ticket(s)
                    </p>
                  </div>
                </td>
                <td>
                  <div className="amount-info">
                    <p className="amount">₦{transaction.amount.toLocaleString()}</p>
                    <p className="currency">{transaction.currency}</p>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>
                  <span className="payment-method">
                    {transaction.paymentMethod}
                  </span>
                </td>
                <td>
                  <div className="transaction-date">
                    <p className="date">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                    <p className="time">
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </td>
                <td className="actions">
                  <button
                    onClick={() => handleTransactionAction(transaction._id, 'verify')}
                    className="action-btn verify"
                    disabled={transaction.status === 'success'}
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleTransactionAction(transaction._id, 'refund')}
                    className="action-btn refund"
                    disabled={transaction.status !== 'success'}
                  >
                    Refund
                  </button>
                  <button
                    onClick={() => handleTransactionAction(transaction._id, 'cancel')}
                    className="action-btn cancel"
                    disabled={transaction.status === 'cancelled' || transaction.status === 'failed'}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="no-transactions">
          <p>No transactions found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Transactions;

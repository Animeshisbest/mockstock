import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Initial stocks data
const INITIAL_STOCKS = [
  { id: 'AAPL', name: 'Apple Inc.', price: 150.00, change: 0 },
  { id: 'GOOGL', name: 'Alphabet Inc.', price: 2800.00, change: 0 },
  { id: 'MSFT', name: 'Microsoft Corp.', price: 300.00, change: 0 },
  { id: 'AMZN', name: 'Amazon.com Inc.', price: 3400.00, change: 0 },
  { id: 'TSLA', name: 'Tesla Inc.', price: 700.00, change: 0 },
  { id: 'NFLX', name: 'Netflix Inc.', price: 500.00, change: 0 },
];

function App() {
  const [balance, setBalance] = useState(10000);
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [portfolio, setPortfolio] = useState({});
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('market');

  // Simulate market price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks =>
        currentStocks.map(stock => {
          const changePercent = (Math.random() * 4 - 2) / 100; // -2% to +2%
          const newPrice = stock.price * (1 + changePercent);
          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((changePercent * 100).toFixed(2))
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBuy = (stock, quantity) => {
    const totalCost = stock.price * quantity;
    if (balance >= totalCost) {
      setBalance(prev => prev - totalCost);
      setPortfolio(prev => {
        const currentQty = prev[stock.id]?.quantity || 0;
        const currentAvg = prev[stock.id]?.avgPrice || 0;
        const newQty = currentQty + quantity;
        const newAvg = ((currentAvg * currentQty) + totalCost) / newQty;
        return {
          ...prev,
          [stock.id]: {
            symbol: stock.id,
            name: stock.name,
            quantity: newQty,
            avgPrice: newAvg
          }
        };
      });
      setHistory(prev => [{
        type: 'BUY',
        symbol: stock.id,
        quantity,
        price: stock.price,
        date: new Date().toLocaleTimeString()
      }, ...prev]);
    } else {
      alert('Insufficient funds!');
    }
  };

  const handleSell = (stock, quantity) => {
    const currentQty = portfolio[stock.id]?.quantity || 0;
    if (currentQty >= quantity) {
      const totalCredit = stock.price * quantity;
      setBalance(prev => prev + totalCredit);
      setPortfolio(prev => {
        const remainingQty = currentQty - quantity;
        if (remainingQty === 0) {
          const newPortfolio = { ...prev };
          delete newPortfolio[stock.id];
          return newPortfolio;
        }
        return {
          ...prev,
          [stock.id]: { ...prev[stock.id], quantity: remainingQty }
        };
      });
      setHistory(prev => [{
        type: 'SELL',
        symbol: stock.id,
        quantity,
        price: stock.price,
        date: new Date().toLocaleTimeString()
      }, ...prev]);
    } else {
      alert('Not enough shares to sell!');
    }
  };

  const calculateTotalValue = () => {
    let stockValue = 0;
    Object.values(portfolio).forEach(item => {
      const currentStock = stocks.find(s => s.id === item.symbol);
      stockValue += item.quantity * (currentStock ? currentStock.price : 0);
    });
    return stockValue + balance;
  };

  return (
    <div className="bg-dark text-light min-vh-100 pb-5">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-black border-bottom border-secondary mb-4 sticky-top">
        <div className="container">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-graph-up-arrow me-2 text-success"></i>
            MockStock
          </span>
          <div className="d-flex align-items-center">
            <div className="me-4 text-end d-none d-md-block">
              <div className="small text-secondary">Virtual Balance</div>
              <div className="fw-bold text-success">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="text-end">
              <div className="small text-secondary">Portfolio Value</div>
              <div className="fw-bold text-info">${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container">
        {/* Navigation Tabs */}
        <div className="nav nav-pills mb-4 bg-black p-2 rounded-3 border border-secondary d-inline-flex">
          <button 
            className={`nav-link ${activeTab === 'market' ? 'active' : 'text-light'}`}
            onClick={() => setActiveTab('market')}
          >
            Market
          </button>
          <button 
            className={`nav-link ${activeTab === 'portfolio' ? 'active' : 'text-light'}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Your Portfolio
          </button>
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : 'text-light'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Market View */}
        {activeTab === 'market' && (
          <div className="row g-4">
            {stocks.map(stock => (
              <StockCard 
                key={stock.id} 
                stock={stock} 
                onBuy={handleBuy} 
                onSell={handleSell}
                owned={portfolio[stock.id]?.quantity || 0}
              />
            ))}
          </div>
        )}

        {/* Portfolio View */}
        {activeTab === 'portfolio' && (
          <div className="card bg-black border-secondary">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Quantity</th>
                      <th>Avg. Price</th>
                      <th>Current Price</th>
                      <th>Profit/Loss</th>
                      <th className="text-end">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(portfolio).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-secondary">
                          Your portfolio is empty. Start trading!
                        </td>
                      </tr>
                    ) : (
                      Object.values(portfolio).map(item => {
                        const currentStock = stocks.find(s => s.id === item.symbol);
                        const currentPrice = currentStock?.price || 0;
                        const value = item.quantity * currentPrice;
                        const pnl = (currentPrice - item.avgPrice) * item.quantity;
                        const pnlPercent = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
                        
                        return (
                          <tr key={item.symbol}>
                            <td>
                              <div className="fw-bold">{item.symbol}</div>
                              <div className="small text-secondary">{item.name}</div>
                            </td>
                            <td>{item.quantity}</td>
                            <td>${item.avgPrice.toFixed(2)}</td>
                            <td>${currentPrice.toFixed(2)}</td>
                            <td className={pnl >= 0 ? 'text-success' : 'text-danger'}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              <span className="small ms-2">({pnlPercent.toFixed(2)}%)</span>
                            </td>
                            <td className="text-end fw-bold">${value.toLocaleString()}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <div className="card bg-black border-secondary">
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                {history.length === 0 ? (
                  <li className="list-group-item bg-transparent text-secondary text-center py-5">
                    No transactions yet.
                  </li>
                ) : (
                  history.map((tx, idx) => (
                    <li key={idx} className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge me-2 ${tx.type === 'BUY' ? 'bg-success' : 'bg-danger'}`}>{tx.type}</span>
                        <span className="fw-bold">{tx.symbol}</span>
                        <span className="text-secondary mx-2">•</span>
                        <span>{tx.quantity} shares @ ${tx.price.toFixed(2)}</span>
                      </div>
                      <div className="small text-secondary">{tx.date}</div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StockCard({ stock, onBuy, onSell, owned }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card bg-black border-secondary h-100 stock-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="card-title mb-0">{stock.id}</h5>
              <div className="small text-secondary">{stock.name}</div>
            </div>
            <div className="text-end">
              <h5 className="mb-0">${stock.price.toFixed(2)}</h5>
              <div className={`small ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.change)}%
              </div>
            </div>
          </div>
          
          <div className="input-group mb-3">
            <span className="input-group-text bg-dark border-secondary text-light">Qty</span>
            <input 
              type="number" 
              className="form-control bg-dark border-secondary text-light" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
            />
          </div>

          <div className="d-grid gap-2">
            <button 
              className="btn btn-success" 
              onClick={() => onBuy(stock, quantity)}
            >
              Buy {stock.id}
            </button>
            <button 
              className="btn btn-outline-danger" 
              onClick={() => onSell(stock, quantity)}
              disabled={owned < quantity}
            >
              Sell {stock.id}
            </button>
          </div>
        </div>
        <div className="card-footer border-secondary bg-transparent py-2">
          <small className="text-secondary">Owned: <span className="text-light">{owned} shares</span></small>
        </div>
      </div>
    </div>
  );
}

export default App;
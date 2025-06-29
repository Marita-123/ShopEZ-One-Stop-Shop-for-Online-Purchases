import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/products`)
      .then(res => {
        setProducts(res.data);
        setFiltered(res.data.filter(p => p.category === 'Shirts'));
      })
      .catch(err => {
        setError('Network error: ' + err.message);
        // Log the full error object for debugging
        console.error('Axios error:', err);
        if (err.response) {
          // Server responded with a status other than 2xx
          console.error('Error data:', err.response.data);
          console.error('Error status:', err.response.status);
          console.error('Error headers:', err.response.headers);
        } else if (err.request) {
          // Request was made but no response received
          console.error('No response received:', err.request);
        } else {
          // Something else happened
          console.error('Error', err.message);
        }
      });
  }, []);

  return (
    <div>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {/* Render your products here */}
    </div>
  );
};

export default Products;

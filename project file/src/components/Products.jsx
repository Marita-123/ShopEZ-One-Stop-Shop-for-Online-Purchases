import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Products.css'

const Products = (props) => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [sortFilter, setSortFilter] = useState('popularity');
    const [categoryFilter, setCategoryFilter] = useState([]);
    const [genderFilter, setGenderFilter] = useState([]);

    const fetchData = async () => {
        try {
            // Fetch products
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
            if (props.category === 'all') {
                setProducts(res.data);
                setVisibleProducts(res.data);
                // Optionally extract unique categories from products
                const uniqueCategories = [...new Set(res.data.map(p => p.category).filter(Boolean))];
                setCategories(uniqueCategories);
            } else {
                const filtered = res.data.filter(product => product.category === props.category);
                setProducts(filtered);
                setVisibleProducts(filtered);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleCategoryCheckBox = (e) => {
        const value = e.target.value;
        if (e.target.checked) {
            setCategoryFilter([...categoryFilter, value]);
        } else {
            setCategoryFilter(categoryFilter.filter(size => size !== value));
        }
    };

    const handleGenderCheckBox = (e) => {
        const value = e.target.value;
        if (e.target.checked) {
            setGenderFilter([...genderFilter, value]);
        } else {
            setGenderFilter(genderFilter.filter(size => size !== value));
        }
    };

    const handleSortFilterChange = (e) => {
        const value = e.target.value;
        setSortFilter(value);
        let sorted = [...visibleProducts];
        if (value === 'low-price') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (value === 'high-price') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (value === 'discount') {
            sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        }
        setVisibleProducts(sorted);
    };

    useEffect(() => {
        let filtered = products;
        if (categoryFilter.length > 0) {
            filtered = filtered.filter(product => categoryFilter.includes(product.category));
        }
        if (genderFilter.length > 0) {
            filtered = filtered.filter(product => genderFilter.includes(product.gender));
        }
        setVisibleProducts(filtered);
        // eslint-disable-next-line
    }, [categoryFilter, genderFilter, products]);

    return (
        <div className="products-container">
            <div className="products-filter">
                <h4>Filters</h4>
                <div className="product-filters-body sub-filter-body">
                    <div className="filter-sort">
                        <h6>Sort By</h6>
                        <div className="filter-sort-body sub-filter-body">
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio1" value="popularity" checked={sortFilter === 'popularity'} onChange={handleSortFilterChange} />
                                <label className="form-check-label" htmlFor="filter-sort-radio1">Popular</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio2" value="low-price" checked={sortFilter === 'low-price'} onChange={handleSortFilterChange} />
                                <label className="form-check-label" htmlFor="filter-sort-radio2">Price (low to high)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio3" value="high-price" checked={sortFilter === 'high-price'} onChange={handleSortFilterChange} />
                                <label className="form-check-label" htmlFor="filter-sort-radio3">Price (high to low)</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="filter-sort-radio4" value="discount" checked={sortFilter === 'discount'} onChange={handleSortFilterChange} />
                                <label className="form-check-label" htmlFor="filter-sort-radio4">Discount</label>
                            </div>
                        </div>
                    </div>
                    {props.category === 'all' &&
                        <div className="filter-categories">
                            <h6>Categories</h6>
                            <div className="filter-categories-body sub-filter-body">
                                {categories.map((category) => (
                                    <div className="form-check" key={category}>
                                        <input className="form-check-input" type="checkbox" value={category} id={'productCategory' + category} checked={categoryFilter.includes(category)} onChange={handleCategoryCheckBox} />
                                        <label className="form-check-label" htmlFor={'productCategory' + category}>{category}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    <div className="filter-gender">
                        <h6>Gender</h6>
                        <div className="filter-gender-body sub-filter-body">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="Men" id="filter-gender-check-1" checked={genderFilter.includes('Men')} onChange={handleGenderCheckBox} />
                                <label className="form-check-label" htmlFor="filter-gender-check-1">Men</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="Women" id="filter-gender-check-2" checked={genderFilter.includes('Women')} onChange={handleGenderCheckBox} />
                                <label className="form-check-label" htmlFor="filter-gender-check-2">Women</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="Unisex" id="filter-gender-check-3" checked={genderFilter.includes('Unisex')} onChange={handleGenderCheckBox} />
                                <label className="form-check-label" htmlFor="filter-gender-check-3">Unisex</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="products-body">
                <h3>All Products</h3>
                <div className="products">
                    {visibleProducts.map((product) => (
                        <div className='product-item' key={product.id || product._id}>
                            <div className="product" onClick={() => navigate(`/product/${product._id || product.id}`)}>
                                <img src={product.mainImg || "https://via.placeholder.com/150"} alt="" />
                                <div className="product-data">
                                    <h6>{product.title || product.name}</h6>
                                    <p>{product.description ? product.description.slice(0, 30) + '....' : ''}</p>
                                    <h5>
                                        &#8377; {parseInt(product.price - (product.price * (product.discount || 0) / 100))}
                                        <s>{product.price}</s>
                                        <p>({product.discount || 0}% off)</p>
                                    </h5>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Products;
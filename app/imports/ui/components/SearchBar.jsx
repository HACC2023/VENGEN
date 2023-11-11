import React, { useState } from 'react';
import { Button, InputGroup, Form } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';

/* A simple static component to render some text for the search bar. */
const SearchBar = ({ handleSearch }) => {
  const [filter, setFilter] = useState('');
  const handleClick = () => {
    handleSearch(filter);
  };

  document.addEventListener('keydown', function (event) {
    if (event.code === 'Enter') {
      event.preventDefault();
      document.getElementById('search-button').click();
    }
  });

  return (
    <InputGroup>
      <Form.Control type="text" onChange={(event) => setFilter(event.target.value)} placeholder="Search..." />
      <Button variant="outline-secondary" id="search-button" onClick={handleClick}><Search /></Button>
    </InputGroup>
  );
};

SearchBar.propTypes = {
  handleSearch: PropTypes.func,
};

SearchBar.defaultProps = {
  handleSearch: () => '',
};

export default SearchBar;

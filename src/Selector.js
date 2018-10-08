import React from 'react';
import PropTypes from 'prop-types';

const Selector = ({ options, onChange }) => {
    const handleChange = (evt) => {
        onChange(evt.target.value);
    }

    return (
        <select id='type-select' defaultValue="select"
            onChange={handleChange} tabIndex='2' aria-label='filter places'>
            <option value="select" disabled>-- Filter Places --</option>
            <option value="all">All Places</option>
            <option value={options[0]}>{options[0]}</option>
            <option value={options[1]}>{options[1]}</option>
            <option value={options[2]}>{options[2]}</option>
            <option value={options[3]}>{options[3]}</option>
            <option value={options[4]}>{options[4]}</option>
            <option value={options[5]}>{options[5]}</option>
        </select>
    )
}

Selector.propTypes = {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
}

export default Selector;

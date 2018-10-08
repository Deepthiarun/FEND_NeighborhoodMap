import React from 'react';
import PropTypes from 'prop-types'

const GMap = ({places, markers}) => {
    return (
        <div id='map' alt='Google Map' role='map' aria-label='google map' tabIndex='99'></div>
    )
}

GMap.propTypes = {
    places: PropTypes.array.isRequired,
    markers: PropTypes.array.isRequired
}

export default GMap
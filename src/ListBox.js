import React from 'react';
import PropTypes from 'prop-types'

const ListBox = ({ places, onClick }) => {
    const onPlaceClick = (source) => {
        onClick(source.target.id)
    }

    // handling Enter and space bar for accessibility
    const onKeyPress = (event, source) => {
        if (event.key === 'Enter' || event.key === ' ') {
            onClick(event.target.id)
        }
    }
    // Starting tab index of list itmes from 10 to avoid conflict. 
    // Place tabIndex + 1 will be used for corresponding infoWindow
    let tabIndex = 10
    return (
        places.map((place) => (
            <div key={place.name} id={place.name} className="list-item"
                role='button' aria-label={place.name}
                tabIndex={tabIndex += 2}                /*tabIndex + 1 will be used for corresponding infoWindow*/
                onClick={onPlaceClick}
                onKeyPress={onKeyPress}                 /* for enter or space keys*/
            >
                {place.name}
            </div>
        ))
    )
}

ListBox.propTypes = {
    places: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired
}

export default ListBox

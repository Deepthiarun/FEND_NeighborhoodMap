import React, { Component } from 'react';

/* global google */

// Component to create individual books 
const InfoWindow = ({ my_makrer }) => {
    
    console.log("INFO WINDOW")
    
    return (
        < div className='info-window' >

        {/* 
        
        {(

    infowindow = new google.maps.InfoWindow()
// Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != my_marker) {
    infowindow.marker = my_marker
    infowindow.setContent(<div> ${marker.title} <p>${marker.id}</p> </div>)
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function () {
        //infowindow.setMarker = null;
    });
}

            )} 
            
            */}
            

        </div >
    )
}
export default InfoWindow
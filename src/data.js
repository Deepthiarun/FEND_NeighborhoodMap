import React, { Component } from 'react';

class Places extends Component{

    static places = [{
              "id": 1,
              "type": "restaurant",
              "name": "Fahrenheit",
              "neighborhood": "Uptown",
              "address": "222 S Caldwell St, Charlotte, NC 28202",
              "latlng": {
              "lat": 35.222696,
              "lng": -80.841225}
          },
          {
              "id": 2,
              "type": "restaurant",
              "name": "The King's Kitchen",
              "neighborhood": "Uptown",
              "address": "129 W Trade St, Charlotte, NC 28202",
              "latlng": {
                  "lat": 35.227963, 
                  "lng": -80.844301}
          },
          {
              "id": 3,
              "type": "restaurant",
              "name": "Basil Thai Cuisine",
              "neighborhood": "Uptown",
              "address": "210 N Church St, Charlotte, NC 28202",
              "latlng": {
              "lat": 35.228952, 
              "lng": -80.842793}
          },
          {    
                  "id": 4,
                  "type": "transit",
                  "name": "CTC Station",
                  "neighborhood": "Uptown",
                  "address": "CTC Charlotte, NC 28202",
                  "latlng": {
                  "lat": 35.225326,  
                  "lng": -80.840885}
          },
          {            
              "id": 5,
              "type": "transit",
              "name": "7th St Station",
              "neighborhood": "Uptown",
              "address": "Lynx Station Charlotte, NC 28202",
              "latlng": {
              "lat": 35.227381,  
              "lng": -80.838087}
          },
          {
              "id": 6,
              "type": "transit",
              "name": "Stonewall",
              "neighborhood": "Uptown",
              "address": "Lynx Station Charlotte, NC 28202",
              "latlng": {
              "lat": 35.221299,   
              "lng": -80.847000}
          },
          {
              "id": 7,
              "type": "transit",
              "name": "Carson",
              "neighborhood": "Uptown",
              "address": "Lynx Station Charlotte, NC 28202",
              "latlng": {
              "lat": 35.218792,   
              "lng": -80.850842}
          }
    ]
}

export default Places
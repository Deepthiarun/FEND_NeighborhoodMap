import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import escapeRegExp from 'escape-string-regexp'
import axios from 'axios'
import './App.css';
import GMap from './Map.js'
import ListBox from './ListBox.js'
import Selector from './Selector';
import register from './registerServiceWorker'
import gm_authFailure from './Error.js'
/* global google */

class App extends Component {

  constructor() {
    super();
    this.setDrawerVisibility = this.setDrawerVisibility.bind(this);
    }
  
  static CLIENT_ID = '3PZ5KN4MTX5RE4S0JNHI1PCAZC2SBSATBVU45AEQGWTPFPQA'
  static CLIENT_SECRET = 'GQM1WEKVHMY5EBSFLNVS4QK4EVJUYAU01OTGLVUGUFVHUL0B'
  static START_LOC = {center: {lat: 35.227211, lng: -80.843099 }, // Charlotte NC
                      zoom: 17}
  static MIN_VIEWPORT = 600 // min viewport widht to keep side drawer always open
  static categoryOptions = ['Bank','Coffee Shop','Hotel','Office','Park','Restaurant']
  static map = null
  static selectedMarkerIcon
  static defaultMarkerIcon

  state = {
    allPlaces: [], // list of all places from API
    filteredPlaces:[], // list of all places matching the filtered category
    places: [], // list of places currently shown on map
    markers: [],
    viewPortWidth: 0, // detected viewport widht
    query: "",  // search querry
    selectedMarker: null, // currently selected marker
    openInfoWindow: null, // currently open info window
    drawerOpen: false, // side drawer visibility
    drawerLoc: [-300, 0], // default (hidden) position of side drawer
    drawerPos: "absolute",
  }

  componentWillMount() {
    this.setDrawerVisibility()      // set visibility of side drawer based on viewport widht
    this.getGoogleMaps();
    this.getAllPlaces() // get place details from FourSquare
  }

  componentDidMount() {
    // register() // register service worker
    window.addEventListener("resize", this.setDrawerVisibility);
    this.loadGoogleMaps()
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setDrawerVisibility);
}
  /**
   * Function to fetch the list of places around the selecetd locaton
   * Uses Four Square API
   */   
  getAllPlaces() {
    let thisLat = App.START_LOC.center.lat
    let thislng = App.START_LOC.center.lng
    this.placesFound = new Promise((resolve) => {
      axios.get(`https://api.foursquare.com/v2/venues/search?client_id=${App.CLIENT_ID}&client_secret=${App.CLIENT_SECRET}&v=20180901&limit=50&ll=${thisLat},${thislng}&section=topPicks`)
      // axios.get(`https://api.foursquare.com/v2/TESTvenuesTEST/search?client_id=${App.CLIENT_ID}&client_secret=${App.CLIENT_SECRET}&v=20180901&limit=50&ll=${thisLat},${thislng}&section=topPicks`)
      .then(response => {
        this.setState({ allPlaces: response.data.response.venues}, function () {
          this.setState({ places: this.state.allPlaces }, function () {
            this.setState({ filteredPlaces: this.state.allPlaces })
          })
        })
        resolve()
      })
      .catch(error => {
        console.log("Error in gettting data from FourSquare: " + error)
        //alert("Error in gettting data from FourSquare: " + error)
        this.venueFailure();
      })
    })
    return this.placesFound
  }
  
  /// Map related funcitons ///
  /**
   * Function to load Google Maps
   * Ref:https://stackoverflow.com/questions/48493960/using-google-map-in-react-component
  **/
  getGoogleMaps() {
    // If we haven't already defined the promise, define it
    if (!this.googleMapsPromise) {
      this.googleMapsPromise = new Promise((resolve) => {
        // Add a global handler for when the API finishes loading
        window.resolveGoogleMapsPromise = () => {
          // Resolve the promise
          resolve(google);
          // Tidy up
          delete window.resolveGoogleMapsPromise;
        };
        // Load the Google Maps API
        const script = document.createElement("script");
        // const API = 'MYAPIKEY';    // for testing map failure
        const API = 'AIzaSyCSDtPE4vebEJTAx1B_97lp5FBIUvFltEs';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API}&callback=resolveGoogleMapsPromise`;
        script.async = true;
        document.body.appendChild(script);
      });
    }
    // Return a promise for the Google Maps API
    return this.googleMapsPromise;
  }

  /**
    * Function to Load Google Maps for the first time
  */   
  loadGoogleMaps() {
    console.log(this.googleMapsPromise)
    this.getGoogleMaps().then(google => {
      App.map = new google.maps.Map(document.getElementById('map'), {
        center: App.START_LOC.center,
        zoom: App.START_LOC.zoom
        })
      this.setMarkerColor()
      this.getAllPlaces().then(() => {
        this.loadMarkers(App.map)
      })
    })
  }

  /**
    * Function to handle errors on getting venues from FourSquare
  */  
  venueFailure() {
    let listContainer = document.getElementById('list-container')
    listContainer.classList.add('list-error')
    listContainer.innerHTML = "ERROR in finding places"
  }
  
  /**
    * Function to handle errors on loading Google Map
  */ 
  mapFailure(error) {
    console.log("Error in getting google map !")
    let mapBox = document.getElementsByClassName('map-box')
    mapBox[0].firstElementChild.remove()
    mapBox[0].classList.add('map-error')
    mapBox[0].innerHTML = '!! Error in loading Google Map !!'
  }

  /// Marker related functions ///
  /**
    * @desc Function to set the color and size for default marker and highlighted marker
  */     
  setMarkerColor() {
    App.defaultMarkerIcon = this.makeMarker('FF1515',[21,40],[10,40])
    App.selectedMarkerIcon = this.makeMarker('FFFF24',[25,45],[12,44])
  }

  /**
    * @desc Function to create custom markers
    * @param {string} color - marker color
    * @param {int} size - maker size setting
    * @param {int} pint - makrer tip setting
  */ 
  makeMarker(color,size,point) {
    let myMarker = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ color +
      '|40|_|%E2%80%A2',
      new google.maps.Size(size[0], size[1]),
      new google.maps.Point(0, 0),
      new google.maps.Point(point[0], point[1]),
      new google.maps.Size(size[0], size[1]))
    return myMarker
  }

  /**
    * @desc Function to show markers on the map based on state.places
    * @param {object} map : the map to show markers
  */   
  loadMarkers(map) {
    var currentMap = map
    var myMarkers = []
    const handleClick = (marker) => {this.handlePlaceClick(marker.title)}
    
    this.state.places.map((place) => {
      let marker = new google.maps.Marker({
        map: currentMap,
        position:place.location.labeledLatLngs[0],
        title: place.name,
        animation: google.maps.Animation.DROP,
        id: place.id,
        icon: App.defaultMarkerIcon
      })
      marker.addListener('click', function () {
        handleClick(marker)
      })
      myMarkers.push(marker)
      return null
    })
    // App.map.fitBounds(bounds);
    this.setState({ markers: myMarkers })
  }

  /**
    * @desc Function to highlight a marker and show an Info Window
    * @param {object} marker : the selected marker
  */   
  showInfoWindow = (marker) => {
    var infowindow = new google.maps.InfoWindow({maxWidth: 200});
    var bounds = new google.maps.LatLngBounds();
    var selectedMarker = this.state.selectedMarker
    var openInfoWindow = this.state.openInfoWindow
    var selectedPlace = this.state.places.filter((place) => place.name === marker.title)
    var placeDetails // additional details about the place from Four Square API
    var infoTabIndex = document.getElementById(selectedPlace[0].name).tabIndex +1

    //console.log(`https://api.foursquare.com/v2/venues/${selectedPlace[0].id}?client_id=${App.CLIENT_ID}&client_secret=${App.CLIENT_SECRET}&v=20180901`)
    axios.get(`https://api.foursquare.com/v2/venues/${selectedPlace[0].id}?client_id=${App.CLIENT_ID}&client_secret=${App.CLIENT_SECRET}&v=20180901`)
      .then(response => {
        placeDetails = response.data.response.venue.description
        if (!placeDetails) {
          placeDetails = "No details found"
        }
      })
      .catch(error => {
        console.log("Error in getting Venu Details from FourSquare. " + error)
      })
    infowindow.setContent(
      `<div tabIndex=${infoTabIndex}><h3>${selectedPlace[0].name}</h3>
      <hr/>
      <p><h4>Address:</h4> ${selectedPlace[0].location.formattedAddress[0]}</p>
      <p><h4>Type:</h4> ${selectedPlace[0].categories[0].name}</p>
      <p><h4>Details:</h4> ${placeDetails?placeDetails:"No details found in FourSquare"}</p></div>`)
    infowindow.addListener('closeclick', function () {marker.setIcon(App.defaultMarkerIcon)})

    if (selectedMarker) {selectedMarker.setIcon(App.defaultMarkerIcon)}
    if (openInfoWindow) {openInfoWindow.close()}
    infowindow.open(App.map, marker)
    marker.setIcon(App.selectedMarkerIcon)
    bounds.extend(marker.position)
    this.setState({ openInfoWindow: infowindow })
    this.setState({selectedMarker: marker})
  }

  /**
    * @desc Function to select the marker for the selected plaace.
    * This function calls the showInfoWindow() to hightlight the marker and show Info Window
    * @param {string} placeName : the selected place name
  */   
  selectMarker(placeName) {
    this.state.markers.map((marker) => {
      if (marker.title === placeName) {
        this.showInfoWindow(marker)
      } else {
        //marker.setIcon(App.selectedMarker)
      }
      return null
    })
  }

  /**
    * @desc Function to clear all markers. Called before showing new set of markres
  */ 
  clearMarkers() {
    this.state.markers.map((marker) => {
      marker.setMap(null)
      return null
    })
      this.setState({ markers: [] }, function() {
      })
  }
  
  /// Functions for category selection ///

  /**
    * @desc Function to handle changes in the 'Place Selector' dropdown
  */  
  handleCategoryChange = (newValue) => {
    this.clearMarkers()
    this.changePlaces(newValue)
  }
  
  /**
    * @desc Function to update the places array in state based on the selected type
  */  
  changePlaces(type) {
    this.setState({ places: [] }, function () {
      if (type === 'all') {
        this.setState({ places: this.state.allPlaces },
          function () {
            // console.log("SETING ALL PLACS: ")
            this.setState({filteredPlaces: this.state.places})
            this.loadMarkers(App.map)
        })
      } else {
        this.setState({ places: this.state.allPlaces.filter((place) => place.categories[0].name.includes(type))},
          function () {
            this.setState({filteredPlaces: this.state.places})
            this.loadMarkers(App.map)
          })
      }
    })
  }

  /// Functions for searching/selecting a place ///

  /**
    * @desc Function to handle selecting a place from the side drawer.
    * This funcaiton is also called when a marker is clicked
  */   
  handlePlaceClick(place) {
    let myBox = document.querySelectorAll(".list-item")
    for (let i = 0; i < myBox.length; i++){
      if (myBox[i].id === place) {
        myBox[i].classList.add('active')
      } else {
        myBox[i].classList.remove('active')
      }
    }
    this.selectMarker(place)
  }

  /**
    * @desc Function to update the place listing (and markers) based on the search text
  */ 
  updateQuery(text){
    this.clearMarkers();
    const match = new RegExp(escapeRegExp(text), 'i')
    this.setState({ places: this.state.filteredPlaces.filter((place) => match.test(place.name)) }, () => {
    this.loadMarkers(App.map)
    })
  }

  //// Funcitons to handle the menu drawer visibility //// 

  /**
    * @desc Function to make the side drawer visible if viewport widht is greater than 1000px
  */
  setDrawerVisibility() {
    var clientWidth = document.documentElement.clientWidth
    this.setState({ viewPortWidth: clientWidth }, function() {
      if (this.state.viewPortWidth > App.MIN_VIEWPORT) {
        this.setState({ drawerLoc: [0, 0] });
        this.setState({ drawerOpen: true })
        this.setState({drawerPos: "relative"})
      }
    })
  }

  /**
    * @desc Function to open and clsoe the side drawer on clicking hamburger icon
  */
  handleDrawerClick = () => {
    if (!this.state.drawerOpen) {
        this.setState({ drawerLoc: [0, 0] });
        this.setState({ drawerOpen: true })
        this.setState({ drawerPos: "relative" })
    } else {
        this.setState({ drawerLoc: [-300, 0] });
        this.setState({ drawerOpen: false })
        this.setState({ drawerPos: "absolute" })
    }
  }

  /**
    * @desc Function to close the side drawer on clicking the map area
    * works only when viewport widht is lesser than the min widht specified by MIN_VIEWPORT
  */  
  handleMapBoxClick = () => {
    if (this.state.viewPortWidth <= App.MIN_VIEWPORT) {
      if (this.state.drawerOpen) {
          this.handleDrawerClick();
      }
    }
  }

  render() {
    const styles = {
        transform: `translate(${this.state.drawerLoc[0]}px, ${this.state.drawerLoc[1]}px)`,
        position: this.state.drawerPos,
    }

    return (
      <Switch>
        <Route exact path='/' render={() => (
          <div id="app" >
            <header className='header'>
              <button id="hamburger" onClick={this.handleDrawerClick}
                aria-label='drawer control' aria-pressed="false"
                tabIndex='1'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M2 6h20v3H2zm0 5h20v3H2zm0 5h20v3H2z"/>
                </svg>
              </button>
              <div className='title-box' role='heading' aria-label='app title'>
                <h2>Queen City Neighborhood Map</h2>
              </div>
            </header>
            <main>
              <div className='filter-box' style={styles}>
                <Selector options={App.categoryOptions} onChange={this.handleCategoryChange}/>
                <input id='place-search' type="text" placeholder="-Search Places-"
                  onChange={(event) => this.updateQuery(event.target.value)}
                tabIndex='3' aria-label='search places'/>
                <div id="list-container">
                      <ListBox places={this.state.places} onClick={(place) => {this.handlePlaceClick(place)}}/>
                </div>
              </div>
              <div className='map-box' alt='Google Map' role='map' aria-label='google map'
                onClick={this.handleMapBoxClick} tabIndex='98'> 
                {/* tabIndex 98 to map-box and 99 to map to make sure it's positioned 
                    after all places in the tab order. Max no of places = 50. */}
                <GMap places={this.state.places} markers={this.state.markers} />
              </div>
            </main>
          </div>
        )}/>
        <Route path='/data/data.json'></Route>
        <Route path='/service-worker.js'></Route>
      </Switch>
    )
  }
}
export default App;

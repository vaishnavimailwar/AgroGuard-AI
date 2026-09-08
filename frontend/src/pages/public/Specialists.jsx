import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "./Specialists.css";

import expert1 from "../../assets/experts/expert1.jpg";
import expert2 from "../../assets/experts/expert2.jpg";
/* =========================================================
   LEAFLET MARKER CONFIGURATION
========================================================= */

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],

    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;


/* =========================================================
   DISTANCE CALCULATION
========================================================= */

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadiusKm * c;
}


/* =========================================================
   MAP RECENTER
========================================================= */

function RecenterMap({ lat, lng }) {
    const map = useMap();

    useEffect(() => {
        if (lat != null && lng != null) {
            map.setView(
                [lat, lng],
                11
            );
        }
    }, [lat, lng, map]);

    return null;
}


/* =========================================================
   DEFAULT LOCATION
========================================================= */

const DEFAULT_CENTER = {
    lat: 17.3297,
    lng: 76.8343,
};


/* =========================================================
   COMPONENT
========================================================= */
const SUPPORT_CENTRES = [
    {
        id: "centre-1",
        name: "Krishi Vigyan Kendra, Kalaburagi",
        category: "Agricultural Support Centre",
        address: "Kalaburagi, Karnataka",
        lat: 17.3297,
        lng: 76.8343,
    },
    {
        id: "centre-2",
        name: "Agricultural Support Centre, Kalaburagi",
        category: "Government Agriculture Office",
        address: "Kalaburagi, Karnataka",
        lat: 17.3500,
        lng: 76.8500,
    },
    {
        id: "centre-3",
        name: "Agricultural Research Centre",
        category: "Agricultural Research Centre",
        address: "Kalaburagi, Karnataka",
        lat: 17.2800,
        lng: 76.9000,
    },
];

const AGRICULTURAL_EXPERTS = [
    {
        id: "Dr.Raju",
        name: "Dr. Raju",
        designation: "Krishi Vigyan Kendra (KVK) Expert",
        expertise: "Crop management, soil assessment and farmer advisory",
        phone: "+91 9448408397",
        image: expert1,
    },
    {
        id: "Dr.Srinivas",
        name: "Dr. Srinivas",
        designation: "Agricultural Extension and Field Advisory",
        expertise: "Crop health, soil management and agricultural guidance",
        phone: "+91 9480519313",
        image: expert2,
    },
];

function Specialists() {

    const [farmerLocation, setFarmerLocation] =
        useState(null);

    const [manualLat, setManualLat] =
        useState("");

    const [manualLng, setManualLng] =
        useState("");

    const [locating, setLocating] =
        useState(false);

    const [locationError, setLocationError] =
        useState("");

    const [nearbyLocations, setNearbyLocations] =
        useState([]);

    const [searchingLocations, setSearchingLocations] =
        useState(false);


    /* =====================================================
       MAP CENTER
    ===================================================== */

    const mapCenter = useMemo(() => {
        return farmerLocation
            ? [
                farmerLocation.lat,
                farmerLocation.lng,
            ]
            : [
                DEFAULT_CENTER.lat,
                DEFAULT_CENTER.lng,
            ];
    }, [farmerLocation]);


    /* =====================================================
       SEARCH REAL AGRICULTURAL SUPPORT LOCATIONS
       USING OPENSTREETMAP / OVERPASS
    ===================================================== */

    const fetchNearbySupportLocations =
        useCallback((lat, lng) => {

            setSearchingLocations(true);
            setNearbyLocations([]);
            setLocationError("");

            try {

                const locations =
                    SUPPORT_CENTRES.map((location) => ({

                        ...location,

                        distanceKm:
                            haversineDistanceKm(
                                lat,
                                lng,
                                location.lat,
                                location.lng
                            ),

                    }))
                        .sort(
                            (a, b) =>
                                a.distanceKm -
                                b.distanceKm
                        )
                        .slice(0, 10);


                setNearbyLocations(
                    locations
                );

            }

            catch (error) {

                console.error(
                    "Support centre search error:",
                    error
                );

                setLocationError(
                    "Unable to find agricultural support centres."
                );

            }

            finally {

                setSearchingLocations(
                    false
                );

            }

        }, []);

    /* =====================================================
       CURRENT LOCATION
    ===================================================== */

    const handleUseCurrentLocation =
        useCallback(() => {

            setLocationError("");

            if (
                typeof navigator ===
                "undefined" ||
                !navigator.geolocation
            ) {

                setLocationError(
                    "Geolocation is not supported by this browser."
                );

                return;
            }


            setLocating(true);


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    const {
                        latitude,
                        longitude,
                    } = position.coords;


                    setFarmerLocation({
                        lat: latitude,
                        lng: longitude,
                    });


                    setManualLat(
                        latitude.toFixed(6)
                    );

                    setManualLng(
                        longitude.toFixed(6)
                    );

                    setLocating(false);

                    fetchNearbySupportLocations(
                        latitude,
                        longitude
                    );
                },


                (error) => {

                    setLocating(false);


                    switch (error.code) {

                        case error.PERMISSION_DENIED:

                            setLocationError(
                                "Location permission was denied. Please enter coordinates manually."
                            );

                            break;


                        case error.POSITION_UNAVAILABLE:

                            setLocationError(
                                "Your location is currently unavailable. Please try again."
                            );

                            break;


                        case error.TIMEOUT:

                            setLocationError(
                                "Location request timed out. Please try again."
                            );

                            break;


                        default:

                            setLocationError(
                                "Something went wrong while getting your location."
                            );
                    }
                },


                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }

            );

        }, [
            fetchNearbySupportLocations,
        ]);


    /* =====================================================
       MANUAL LOCATION SEARCH
    ===================================================== */

    const handleManualSearch =
        useCallback((event) => {

            event.preventDefault();

            setLocationError("");


            const lat =
                parseFloat(manualLat);

            const lng =
                parseFloat(manualLng);


            if (
                Number.isNaN(lat) ||
                Number.isNaN(lng) ||
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {

                setLocationError(
                    "Please enter valid latitude and longitude values."
                );

                return;
            }


            setFarmerLocation({
                lat,
                lng,
            });

            fetchNearbySupportLocations(
                latitude,
                longitude
            );
        }, [
            manualLat,
            manualLng,
            fetchNearbySupportLocations
        ]);


    /* =====================================================
       GOOGLE MAPS DIRECTIONS
    ===================================================== */

    const getDirectionsUrl =
        (location) => {

            if (!farmerLocation) {

                return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
            }


            return `https://www.google.com/maps/dir/?api=1&origin=${farmerLocation.lat},${farmerLocation.lng}&destination=${location.lat},${location.lng}`;
        };


    return (

        <div className="specialists-page">


            {/* HERO */}

            <section className="specialists-hero">

                <div className="specialists-container">

                    <div className="specialists-hero-grid">


                        <div className="specialists-hero-copy">

                            <div className="specialists-eyebrow">
                                AGRICULTURAL SPECIALIST NETWORK
                            </div>


                            <h1>
                                Technology
                                <br />
                                meets
                                <span> expertise.</span>
                            </h1>


                            <p>
                                AgroGuard-AI helps connect field intelligence
                                with agricultural specialists so complex crop
                                problems can receive informed human attention.
                            </p>


                            <div className="specialists-actions">

                                <Link
                                    to="/workflow"
                                    className="specialists-btn specialists-btn-primary"
                                >
                                    Explore the workflow
                                    <span>→</span>
                                </Link>


                                <Link
                                    to="/portal"
                                    className="specialists-btn specialists-btn-secondary"
                                >
                                    Farmer Portal
                                </Link>

                            </div>

                        </div>


                        <div className="specialists-visual">

                            <div className="specialists-orbit orbit-one" />

                            <div className="specialists-orbit orbit-two" />

                            <div className="specialists-orbit orbit-three" />


                            <div className="specialists-center">

                                <div className="specialists-center-icon">
                                    AI
                                </div>

                                <strong>
                                    AgroGuard
                                </strong>

                                <span>
                                    Field Intelligence
                                </span>

                            </div>


                            <div className="specialist-node node-one">

                                <strong>
                                    AI
                                </strong>

                                <span>
                                    Detection
                                </span>

                            </div>


                            <div className="specialist-node node-two">

                                <strong>
                                    01
                                </strong>

                                <span>
                                    Field
                                </span>

                            </div>


                            <div className="specialist-node node-three">

                                <strong>
                                    02
                                </strong>

                                <span>
                                    Expert
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* INTRO */}

            <section className="specialists-section">

                <div className="specialists-container">

                    <div className="specialists-section-head">

                        <div>

                            <span className="specialists-label">
                                WHY SPECIALIST SUPPORT
                            </span>

                            <h2>
                                AI can identify.
                                <br />
                                <em>
                                    Experts interpret.
                                </em>
                            </h2>

                        </div>


                        <p>
                            Agricultural decisions often depend on context.
                            AgroGuard-AI provides field-level information that
                            helps expert assessment become faster and more
                            informed.
                        </p>

                    </div>


                    <div className="specialists-feature-grid">


                        <article className="specialist-feature">

                            <span>01</span>

                            <div>

                                <h3>
                                    Field evidence
                                </h3>

                                <p>
                                    Drone imagery and AI analysis provide a
                                    visual starting point for understanding
                                    what is happening across the field.
                                </p>

                            </div>

                        </article>


                        <article className="specialist-feature">

                            <span>02</span>

                            <div>

                                <h3>
                                    Risk context
                                </h3>

                                <p>
                                    Detected problem areas can be organised
                                    according to severity and spatial risk.
                                </p>

                            </div>

                        </article>


                        <article className="specialist-feature">

                            <span>03</span>

                            <div>

                                <h3>
                                    Human decision support
                                </h3>

                                <p>
                                    Specialists can use generated information
                                    to support recommendations and field-level
                                    decisions.
                                </p>

                            </div>

                        </article>

                    </div>

                </div>

            </section>


            {/* EXPERT CONNECT */}

            <section
                id="expert-connect"
                className="specialists-connect"
            >

                <div className="specialists-container">


                    <span className="specialists-label">
                        EXPERT CONNECT
                    </span>


                    <h2 className="connect-heading">

                        Find agricultural

                        <br />

                        <em>
                            support near you.
                        </em>

                    </h2>


                    <p className="connect-subtext">

                        Share your current location or
                        enter coordinates manually to
                        find nearby agricultural
                        support centres.

                    </p>


                    <div className="connect-layout">


                        {/* LEFT PANEL */}

                        <div className="connect-panel">


                            <div className="connect-locate-box">


                                <button
                                    type="button"
                                    className="specialists-btn specialists-btn-primary connect-locate-btn"
                                    onClick={
                                        handleUseCurrentLocation
                                    }
                                    disabled={locating}
                                >

                                    {locating
                                        ? "Locating..."
                                        : "Use My Current Location"
                                    }

                                    <span>
                                        📍
                                    </span>

                                </button>


                                {locationError && (

                                    <p className="connect-error-text">

                                        {locationError}

                                    </p>

                                )}


                                {farmerLocation && (

                                    <div className="connect-location-success">

                                        <strong>
                                            Location detected
                                        </strong>

                                        <p>

                                            Latitude:{" "}

                                            {farmerLocation.lat.toFixed(
                                                6
                                            )}

                                            <br />

                                            Longitude:{" "}

                                            {farmerLocation.lng.toFixed(
                                                6
                                            )}

                                        </p>

                                    </div>

                                )}


                                <div className="connect-divider">

                                    <span>
                                        OR ENTER COORDINATES
                                    </span>

                                </div>


                                <form
                                    className="connect-manual-form"
                                    onSubmit={
                                        handleManualSearch
                                    }
                                >


                                    <div className="connect-input-row">


                                        <label>

                                            LATITUDE

                                            <input
                                                type="number"
                                                step="any"
                                                value={manualLat}
                                                onChange={(event) =>
                                                    setManualLat(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="17.3297"
                                            />

                                        </label>


                                        <label>

                                            LONGITUDE

                                            <input
                                                type="number"
                                                step="any"
                                                value={manualLng}
                                                onChange={(event) =>
                                                    setManualLng(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="76.8343"
                                            />

                                        </label>

                                    </div>


                                    <button
                                        type="submit"
                                        className="specialists-btn specialists-btn-secondary connect-manual-btn"
                                    >

                                        Search Location

                                    </button>

                                </form>

                            </div>


                            {/* RESULTS */}

                            <div className="connect-results">


                                {!farmerLocation && (

                                    <div className="connect-state-box connect-state-idle">

                                        Use your current location
                                        or enter latitude and
                                        longitude to view nearby
                                        agricultural support
                                        centres.

                                    </div>

                                )}


                                {searchingLocations && (

                                    <div className="connect-state-box">

                                        <div className="connect-spinner" />

                                        Searching real nearby
                                        agricultural support centres...

                                    </div>

                                )}


                                {farmerLocation &&
                                    !searchingLocations &&
                                    nearbyLocations.length === 0 && (

                                        <div className="connect-state-box">

                                            No agricultural support centres
                                            were found within 50 km of this
                                            location.

                                        </div>

                                    )}


                                {nearbyLocations.map(
                                    (location) => (

                                        <article
                                            className="connect-card"
                                            key={location.id}
                                        >


                                            <div className="connect-card-top">


                                                <span className="connect-card-category">

                                                    {
                                                        location.category
                                                    }

                                                </span>


                                                <span className="connect-card-distance">

                                                    {
                                                        location.distanceKm.toFixed(
                                                            2
                                                        )
                                                    }

                                                    {" "}km

                                                </span>

                                            </div>


                                            <h3>

                                                {location.name}

                                            </h3>


                                            <p className="connect-card-address">

                                                {
                                                    location.address
                                                }

                                            </p>


                                            <p className="connect-card-coords">

                                                {location.lat.toFixed(6)}

                                                {", "}

                                                {location.lng.toFixed(6)}

                                            </p>


                                            <a
                                                href={getDirectionsUrl(
                                                    location
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="connect-card-directions"
                                            >

                                                Get Directions →

                                            </a>

                                        </article>

                                    )
                                )}

                            </div>

                        </div>


                        {/* MAP */}

                        <div className="connect-map-wrap">


                            <MapContainer
                                center={mapCenter}
                                zoom={11}
                                className="connect-map"
                            >


                                <TileLayer
                                    attribution="&copy; OpenStreetMap contributors"
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />


                                <RecenterMap
                                    lat={
                                        farmerLocation?.lat
                                    }
                                    lng={
                                        farmerLocation?.lng
                                    }
                                />


                                {farmerLocation && (

                                    <Marker
                                        position={[
                                            farmerLocation.lat,
                                            farmerLocation.lng,
                                        ]}
                                    >

                                        <Popup>

                                            <strong>
                                                Your Location
                                            </strong>

                                            <br />

                                            Latitude:{" "}

                                            {
                                                farmerLocation.lat.toFixed(
                                                    6
                                                )
                                            }

                                            <br />

                                            Longitude:{" "}

                                            {
                                                farmerLocation.lng.toFixed(
                                                    6
                                                )
                                            }

                                        </Popup>

                                    </Marker>

                                )}


                                {nearbyLocations.map(
                                    (location) => (

                                        <Marker
                                            key={location.id}
                                            position={[
                                                location.lat,
                                                location.lng,
                                            ]}
                                        >

                                            <Popup>

                                                <strong>
                                                    {
                                                        location.name
                                                    }
                                                </strong>

                                                <br />

                                                {
                                                    location.category
                                                }

                                                <br />

                                                {
                                                    location.distanceKm.toFixed(
                                                        2
                                                    )
                                                }

                                                {" "}km away

                                            </Popup>

                                        </Marker>

                                    )
                                )}

                            </MapContainer>

                        </div>

                    </div>

                </div>

            </section>

            {/* AGRICULTURAL EXPERTS */}

            <section className="experts-section">

                <div className="specialists-container">

                    <div className="experts-section-head">

                        <div>

                            <span className="specialists-label">
                                AGRICULTURAL EXPERTS
                            </span>

                            <h2>
                                Connect with
                                <br />

                                <em>
                                    agricultural expertise.
                                </em>
                            </h2>

                        </div>


                        <p>

                            AgroGuard-AI helps farmers access
                            agricultural guidance by connecting
                            field intelligence with expert support.

                        </p>

                    </div>


                    <div className="experts-grid">

                        {AGRICULTURAL_EXPERTS.map(
                            (expert) => (

                                <article
                                    className="expert-card"
                                    key={expert.id}
                                >

                                    <img
                                        src={expert.image}
                                        alt={expert.name}
                                        className="expert-image"
                                    />


                                    <div className="expert-content">

                                        <span className="expert-tag">

                                            AGRICULTURAL EXPERT

                                        </span>


                                        <h3>{expert.name}</h3>
                                        <p className="expert-designation">{expert.designation}</p>
                                        <p className="expert-expertise">{expert.expertise}</p>

                                        <div className="expert-phone">
                                            {expert.phone}
                                        </div>

                                        <a
                                            href={`tel:${expert.phone.replace(/\s/g, "")}`}
                                            className="expert-contact-btn"
                                        >
                                            Contact Expert
                                            <span>→</span>
                                        </a>
                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </div>

            </section>

            {/* WORKFLOW */}

            <section className="specialists-workflow">

                <div className="specialists-container">


                    <div className="specialists-label">
                        SPECIALIST WORKFLOW
                    </div>


                    <h2>

                        From detection

                        <br />

                        to <em>expert action.</em>

                    </h2>


                    <div className="specialist-process">


                        <div className="process-step">

                            <div className="process-number">
                                01
                            </div>

                            <h3>
                                Field monitoring
                            </h3>

                            <p>
                                Drone imagery captures the
                                agricultural area for
                                analysis.
                            </p>

                        </div>


                        <div className="process-line" />


                        <div className="process-step">

                            <div className="process-number">
                                02
                            </div>

                            <h3>
                                AI assessment
                            </h3>

                            <p>
                                The system identifies
                                potential crop threats
                                and affected areas.
                            </p>

                        </div>


                        <div className="process-line" />


                        <div className="process-step">

                            <div className="process-number">
                                03
                            </div>

                            <h3>
                                Specialist review
                            </h3>

                            <p>
                                Agricultural expertise can
                                be applied to generated
                                field information.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* CTA */}

            <section className="specialists-cta">

                <div className="specialists-container">


                    <div className="specialists-cta-box">


                        <div>

                            <span className="specialists-label">
                                AGROGUARD-AI
                            </span>

                            <h2>

                                Better field data.

                                <br />

                                Better decisions.

                            </h2>

                        </div>


                        <Link
                            to="/portal"
                            className="specialists-btn specialists-btn-primary"
                        >

                            Enter Farmer Portal

                            <span>→</span>

                        </Link>

                    </div>

                </div>

            </section>

        </div>
    );
}


export default Specialists;
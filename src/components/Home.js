import React, { useContext, useRef, useEffect, useCallback } from "react";
import Header from "./Header";
import AddressPicker from "./AddressPicker";
import RideList from "./RideList";
import RideDetail from "./RideDetails";
import Context from "../Context";
import L from "leaflet";
import "leaflet-routing-machine";

const style = {
  width: "100%",
  height: "100vh",
};

function Home() {
  const { selectedFrom, selectedTo, user, currentRide } = useContext(Context);
  const mapRef = useRef(null);
  const map = useRef(null);
  const routeControl = useRef(null);

  const initMap = useCallback(() => {
    if (map.current) return;
    map.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);
    initRouteControl();
  }, []);

  const initRouteControl = () => {
    if (!map.current) {
      console.error("Map is not available.");
      return;
    }
    routeControl.current = L.Routing.control({
      waypoints: [],
      show: true,
      fitSelectedRoutes: true,
      plan: false,
      lineOptions: {
        styles: [
          {
            color: "blue",
            opacity: 1,
            weight: 5,
          },
        ],
      },
    }).addTo(map.current);
  };

  const drawRoute = useCallback(async (from, to) => {
    if (shouldRouteDrawed(from, to) && routeControl.current) {
      console.log("From:", from, "To:", to);
      const routeCoordinates = await getRoute(from, to);
      if (routeCoordinates) {
        const waypoints = routeCoordinates.map((coord) =>
          L.latLng(coord[1], coord[0])
        );
        console.log("Waypoints:", waypoints);
        routeControl.current.setWaypoints(waypoints);

        const bounds = L.latLngBounds(waypoints);
        map.current.fitBounds(bounds);
      } else {
        console.error("No route coordinates returned.");
      }
    } else {
      console.log("Route not drawn. Conditions not met.");
    }
  }, []);

  const shouldRouteDrawed = (from, to) => {
    return (
      from && to && from.label && to.label && from.x && to.x && from.y && to.y
    );
  };

  const getRoute = async (from, to) => {
    const apiKey = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
    try {
      console.log("Sending coordinates:", [
        [from.x, from.y],
        [to.x, to.y],
      ]);
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [
              [from.x, from.y],
              [to.x, to.y],
            ],
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeCoordinates = route.geometry.coordinates;
        const distance = route.summary.distance;
        console.log(`Distance: ${(distance / 1000).toFixed(2)} km`);
        return routeCoordinates || null;
      } else {
        console.error("No routes found in the response.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching route: ", error);
      return null;
    }
  };

  const renderSidebar = () => {
    const isUser = user && user.role === "user";
    if (isUser && !currentRide) {
      return <AddressPicker />;
    }
    if (isUser && currentRide) {
      return (
        <RideDetail
          user={currentRide.driver}
          isDriver={false}
          currentRide={currentRide}
        />
      );
    }
    if (!isUser && !currentRide) {
      return <RideList />;
    }
    if (!isUser && currentRide) {
      return (
        <RideDetail
          user={currentRide.requestor}
          isDriver={true}
          currentRide={currentRide}
        />
      );
    }
  };

  useEffect(() => {
    initMap();
  }, [initMap]);

  useEffect(() => {
    if (shouldRouteDrawed(selectedFrom, selectedTo)) {
      drawRoute(selectedFrom, selectedTo);
    }
  }, [selectedFrom, selectedTo, drawRoute]);

  return (
    <>
      <Header />
      <div ref={mapRef} style={style}></div>
      {renderSidebar()}
    </>
  );
}

export default Home;

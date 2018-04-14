

Libray for drawing animated routes in Google Maps

# Documentation

First create an instance of the AnimateRoute class, passing in the 
the google.maps.Map instance, and the google.maps.DirectionsRenderer instance which will be used
for drawing the route.

```
this.routeAnimation = new AnimateRoute(google.maps.Map, google.maps.DirectionsRenderer);

```

To animate a route, pass in the response from a google.maps.DirectionsService.route() call to
the AnimateRoute.animate method

```
this.routeAnimation.animate(response);

```

# Demo

To run the demo

```
git clone https://github.com/smaameri/animated-map-routes.git
cd animated-map-routes
npm install
node server.js
```

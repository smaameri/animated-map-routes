function AnimateRoute(map, directionsRender, opts){

    // google.maps.DirectionsRenderer object for rendering routes
    this.directionsRenderer = directionsRender;

    // options
    this.opts = opts || {};

    // interval between routes points
    this.interval = this.opts.interval || null;

    //number of sections to split route into
    this.numberOfSections = this.opts.numberOfSections || 100;

    // timeout between route animations
    this.timeout = this.opts.timeout || 20;

    // true to show the animation on replay
    this.replay = this.opts.interval || true;

    // response from a google.maps.DirectionsService() call
    this.directionsResponse = null;

    // number of steps in the DirectionsService response.
    this.steps = null;

    // current step index we are iterating through
    this.stepIndex = null;

    // current path index we are iterating through
    this.pathIndex = null;

    // steps we have already iterated through
    this.baseSteps = null;

    // number of steps to carry over in the iterating function
    this.carryOver = 0;

    // true to break from the animation loop
    this.breakAnimation = false;

    // true to also play the animation in reverse
    this.reverse = false;
};


/**
 * get the steps from the DirectionsService response
 * @returns {Array} the steps
 */
AnimateRoute.prototype.getSteps  = function(){
    const directions = this.directionsResponse;
    return JSON.parse(JSON.stringify(directions.routes[0].legs[0].steps));
};

/**
 * @param {Array} steps
 * @returns {Number} the number of steps
 */
AnimateRoute.prototype.getNumberOfSteps = function(steps){
    return steps.length;
};

/**
 * Get the paths from a step
 * @param {Object} a step object
 * @returns {Array} the paths in a steps
 */
AnimateRoute.prototype.getPaths  = function(step){
    return step.path;
};

/**
 * Get the total number of paths in a DirectionsService response
 * @param {Array} steps in the DirectionsService response
 * @returns {Number} the number of paths
 */
AnimateRoute.prototype.getTotalNumberOfPaths = function(steps){
    return steps.reduce(function (accumulator, step) {
        return accumulator + step.path.length;
    }, 0);
};

/**
 * Get the number of element that should be in each iteration of the animations step.
 * @param {Array} steps in the DirectionsService response
 * @returns {number}
 */
AnimateRoute.prototype.getIterationSize = function(steps){
    return Math.ceil(this.getTotalNumberOfPaths(steps)/this.numberOfSections);
};

/**
 * Clear the animation
 */
AnimateRoute.prototype.clearRouteAnimation = function(){
    this.breakAnimation = true;
    clearTimeout(this.renderTimeout);
    clearTimeout(this.replayTimeout);
    this.directionsRenderer.setDirections({routes: []});
};

/**
 * Base method used to start the animation.
 * @param {google.maps.DirectionsService} directions
 */
AnimateRoute.prototype.animate = function(directions){
    if(directions) this.directionsResponse = directions;

    this.breakAnimation = false;
    this.steps = this.getSteps();
    this.interval = this.getIterationSize(this.steps);
    this.totalPaths = this.getNumberOfSteps(this.steps);

    this.baseSteps = null;

    this.stepIndex = 0;
    this.pathIndex = 0;
    this.carryOver = 0;

    // used to track progress through the iteration, and to update the line
    // opacity accordingly
    this.counter = 0;

    this.renderTimeout = null;
    this.replayTimeout = null;


    if (this.totalPaths > 5000) {
        // iterate only through the steps. Iterating through the paths
        // with this many steps is too memory intensive and will render
        // slowly in the browser.
        this.animateSteps()
    } else {
        this.animatePaths()
    }
};

/**
 * Switched between forward and reverse animation of the route.
 */
AnimateRoute.prototype.animatePaths = function(){
    if(this.reverse){
        this.animatePathsReverse();
    } else {
        this.directionsRenderer.polylineOptions.strokeOpacity = 1;
        this.animatePathsForward();
    }
};

/**
 * Helper function to log results to console.
 */
AnimateRoute.prototype.printDetails = function(){
    console.log('total steps', this.totalPaths);
    console.log('total paths', this.getTotalNumberOfPaths(this.getSteps()));
    console.log('interval ', this.interval);
    console.log('total sections', this.numberOfSections);
    console.log('timeout', this.timeout)
};

/**
 * Updates the line opacity during the animation.
 */
AnimateRoute.prototype.updateLineOpacity = function(){
    const progress = this.counter/this.numberOfSections;

    const fadeOutFinish = 0.9;
    const fadeOutStart = 0.2;

    let opacity;

    if(progress > fadeOutFinish){
        opacity = 0
    } else if (fadeOutStart < progress && progress < fadeOutFinish) {
        opacity = 1 - progress
    } else {
        opacity = 1;
    }

    this.directionsRenderer.polylineOptions.strokeOpacity = opacity;
};

/**
 * Builds up the 'base steps' array by iterating through all the steps, and
 * creates builds up the base steps array with paths of equal size each time.
 * Builds the steps array from 0 to the full size, and hence create an animation
 * of the path moving in the forward direction
 */
AnimateRoute.prototype.animatePathsForward = function(){
    if(this.breakAnimation) return;

    // current step index we are iterating through
    const stepIndex = this.stepIndex;
    const steps = this.getSteps();
    const cutOff = this.interval + this.pathIndex - this.carryOver;
    this.baseSteps = steps.slice(0,stepIndex + 1);

    if(stepIndex >= steps.length){
        // we have iterated through all the steps, so we display the entire
        // route, and start to replay the animation in reverse.
        this.directionsRenderer.setDirections(this.directionsResponse);
        if(this.replay){
            this.reverse = true;
            this.animate();
        }
    } else if (steps[stepIndex].path.length > cutOff ){
        // the number of paths in our interval can be taken up by the paths
        // available in this step
        this.counter ++;
        this.carryOver = 0;
        this.baseSteps[stepIndex].path = steps[stepIndex].path.slice(0, cutOff);
        this.pathIndex = cutOff;

        // create a deep copy of the directionsResponse
        const directions = JSON.parse(JSON.stringify(this.directionsResponse));
        directions.routes[0].legs[0].steps = this.baseSteps;
        this.directionsRenderer.setDirections(directions);
        this.renderTimeout = setTimeout(this.animatePathsForward.bind(this), this.timeout)
    } else if ( steps[stepIndex].path.length <= cutOff  ){
        // there are not enough paths the step to fill our interval, so we need to
        // move onto the next step
        this.carryOver =  cutOff - steps[stepIndex].path.length;
        this.pathIndex = 0;
        this.stepIndex ++;
        this.animatePathsForward();
    }
};

/**
 * Breaks down the 'base steps' array by iterating through all the steps, and
 * breaks downn the base steps array with paths of equal size each time.
 * Hence it creates an animation of the path moving in the reverse direction
 */
AnimateRoute.prototype.animatePathsReverse = function(){
    if(this.breakAnimation) return;

    const stepIndex = this.stepIndex;
    const steps = this.getSteps();
    const cutOff = this.interval + this.pathIndex - this.carryOver;

    this.baseSteps = steps.slice(stepIndex);

    if(stepIndex>= steps.length){
        this.reverse = false;
        this.directionsRenderer.setDirections({routes: []});
        if(this.replay){
            this.replayTimeout = setTimeout(this.animate.bind(this), 200)
        }
    } else if ( steps[stepIndex].path.length > cutOff ){
        this.counter ++;
        this.carryOver = 0;
        this.baseSteps[0].path = steps[stepIndex].path.slice(cutOff);
        this.pathIndex = cutOff;
        const directions = JSON.parse(JSON.stringify(this.directionsResponse));
        directions.routes[0].legs[0].steps = this.baseSteps;
        this.updateLineOpacity();
        this.directionsRenderer.setDirections(directions);
        this.renderTimeout = setTimeout(this.animatePathsReverse.bind(this), this.timeout)
    } else if ( steps[stepIndex].path.length <= cutOff  ){
        this.carryOver =  steps[stepIndex].path.length - this.pathIndex;
        this.pathIndex = 0;
        this.stepIndex ++;
        this.animatePathsReverse();
    }
};

/**
 * Base method used for iterating through the steps.
 */
AnimateRoute.prototype.animateSteps = function(){
    this.interval = Math.round(this.steps.length/this.numberOfSections);
    this.stepIndex = 0;
    this.renderStepSections()
};

/**
 * Renders each of the steps.
 */
AnimateRoute.prototype.renderStepSections = function(){
    const steps = this.getSteps();
    if(this.stepIndex >= steps.length){
        this.directionsRenderer.setDirections(this.directionsResponse);
        if(this.replay){
            this.replayTimeout = setTimeout(this.animate.bind(this), 1000)
        }
    } else{
        this.renderTimeout = setTimeout(function(){
            const stepsSection = steps.slice(0,this.stepIndex + 1);
            directions.routes[0].legs[0].steps = stepsSection;
            this.directionsRenderer.setDirections(directions);
            this.stepIndex += this.interval;
            this.renderStepSections();
        }.bind(this), this.timeout)
    }
};

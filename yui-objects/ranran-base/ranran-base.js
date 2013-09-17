YUI.add('ranran-base', function (Y) {
  var RANRAN = "RanRan";
  
  Y.namespace(RANRAN);
  Y.RanRan.Config = {
    DEFAULT_MIN_WIDTH: 200,
	  DEFAULT_INITIAL_HEIGHT: 200,
	  RANRAN: RANRAN,
	  
  };
}, '0.1', {requires: ['ranran-base-css']})
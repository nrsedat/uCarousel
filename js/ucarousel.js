/*
*	uCarousel
*	Author: Ratheesh Naithalath
*	Requires jQuery >= 1.7
*/

(function($){
    "use strict";
	var Utils = (function(){
		var hasTouch = Object.prototype.hasOwnProperty.call(document,'ontouchend'),
		getProperty = function(name){
			var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
				testStyle = document.createElement('div').style;
				for (var i = 0; i < prefixes.length; ++i) {
					if (testStyle[prefixes[i] + name] !== undefined) {
						return prefixes[i] + name;
					}
				}
			return;
		},
		events = hasTouch ? {down: 'touchstart',move: 'touchmove',up: 'touchend'} : 
						{down: 'mousedown',move: 'mousemove',up: 'mouseup'},
		getCursorPosition = hasTouch ? function (e) {e = e.originalEvent || e;return {x: e.touches[0].clientX,y: e.touches[0].clientY};} : 
							function (e) {return {x: e.clientX,y: e.clientY};},
		setTransitions = function(element, enable) {
			return enable ? element.style[durationProperty] = '' : element.style[durationProperty] = '0s';
		},
		requestAnimationFrame = (function () {
			var prefixed = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60);},
			requestAnimationFrame = function () {
				prefixed.apply(window, arguments);
			};
			return requestAnimationFrame;
		})();
		return {
			hasTouch: hasTouch,
			events: events,
			getCursorPosition: getCursorPosition,
			setTransitions: setTransitions,
			requestAnimationFrame: requestAnimationFrame,
			getProperty: getProperty
		};
	})();
	window.uUtils = Utils;

	var UCarousel = (function($,Utils){
		var defaults = {
			dragRadius: 10,
			moveRadius: 20,
			loop: true,
			drag : true,
			slideDuration : 500
			}, id = 0,
			Carousel,
			createId;

		// Constructor
		Carousel = function(element,options){
			this.setOptions(options);
			this.initElements(element);
			if(!this.$items.length){return;}
			this.setId();
			this.$element.trigger('slideChange.ucarousel',[1]);
		};

		Carousel.prototype.setOptions = function (opts) {
                var options = this.options || $.extend({}, defaults, opts);
                this.options = options;
            };

		/*
             *   $(element).uCarousel(initElements)
             *   @Description:- Initializes the carousel elements.
             *   @ param     :- The carousel container element
             */
		Carousel.prototype.initElements = function(element){
			this.$element = $(element);
			this.$items = this.$element.children().children(); 
		};

            /*
             *   $(element).uCarousel(id)
             *   @Description:- Sets unique id for the carousel.
             *   @ param     :- None
             */
            Carousel.prototype.setId = function () {
                var newId = createId();
                this.id = function () {
                    return newId;
                };
                return newId;
            };

            createId = function () {
                return id++;
            };


		return Carousel;
	})(jQuery,window.uUtils);

	//Add Carousel to the jQuery.fn object
	$.fn.uCarousel = function (method) {
		var args = arguments;
		this.each(function () {
			var carousel = this._carousel;
			if (carousel && method && carousel[method]) {
				carousel[method].apply(carousel,Array.prototype.slice.call(args,1));
			} else if (typeof method === 'object' || !method) {
				carousel = new UCarousel(this, method);
				this._carousel = carousel;
			} else {
				$.error('Method ' + method + ' does not exist on jQuery.Carousel');
			}
		});
		return this;
	};
})(jQuery);
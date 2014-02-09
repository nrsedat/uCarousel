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
            Carousel = function (element, options) {
                this.setOptions(options);
                this.initElements(element);
                if(!this.$elmnts.length) {
                    return;
                }
                this.align();
                this.id();
                this.bind();
                this.slideChange();
            };

            // Expose Dfaults
            Carousel.defaults = defaults;

            Carousel.prototype.setOptions = function (opts) {
                var options = this.options || $.extend({}, defaults, opts);
                this.options = options;
            };

            /*
             *   $(element).uCarousel(initElements)
             *   @Description:- Initializes the carousel elements.
             *   @ param     :- The carousel container element
             */

            Carousel.prototype.initElements = function (element) {
                this.$element = $(element);
                this.$sliderList = $(element)
                    .children();
                this.$elmnts = this.$sliderList.children();
                this.$sliderList.html(this.$elmnts);
                this.increment = this.$elmnts.outerWidth(true);
                this.numElmts = this.$elmnts.length;
                this.shownInViewport = Math.round($(element).width() / this.increment);
                this.firstElementOnViewPort = 1;
                this.isAnimating = this._needsUpdate = false;
                this._offsetDrag = this._offset = this._swipeOffset = 0;

            };

            /*
             *   $(element).uCarousel(align)
             *   @Description :- Method to make life easier. Calls
             *                   initOffset,setWidth and append methods in proper order.
             */
            Carousel.prototype.align = function () {
                this.initOffset();
                if(this.options.loop){
                    this.$elmnts.each(function(ind,item){
                        $(item).addClass('data-item'+ind);
                    });
                    this.append();
                }
            }

            /*
             *   $(element).uCarousel(initOffset)
             *   @Description:- Sets the initial offset for this carousel.
             *   @ param     :- None
             */
            Carousel.prototype.initOffset = function () {
                var multiplier = this.shownInViewport + 1;
                if(this.options.loop){
                    this._startOffset = -this.increment * multiplier;
                }else {
                    this._startOffset = 0;
                }
                this.setLeft(this._startOffset);
            }

            /*
             *   $(element).uCarousel(setLeft)
             *   @Description:- Sets the left position for the item container.
             *   @ param     :- Left offset for the carousel item container.
             */
            Carousel.prototype.setLeft = function (offset) {
                this.$sliderList.css('left', offset + 'px');
            }

            /*
             *   $(element).uCarousel(append)
             *   @Description:- Sets the width of the item container.
             *   @ param     :- None
             */
            Carousel.prototype.append = function () {
                //Looping logic first part. Clone and append the number of items
                //that the user can see, to the end and beginning of the actual items.
                for (var i = 0; i <= this.shownInViewport; i++) {
                    this.$sliderList.append(this.$elmnts.eq(i%(this.numElmts - 1)).clone())
                        .prepend(this.$elmnts.eq(-(i%(this.numElmts - 1) + 1)).clone());
                };
            }

            /*
             *   $(element).uCarousel(id)
             *   @Description:- Sets unique id for the carousel.
             *   @ param     :- None
             */
            Carousel.prototype.id = function () {
                var newId = createId();

                this.id = function () {
                    return newId;
                };

                return newId;
            };

            createId = function () {
                return id++;
            };

            /*
             *   $(element).uCarousel(bind)
             *   @Description:- Binds different handlers to the carousel
             *   @ param     :- None
             */
            Carousel.prototype.bind = function () {
                var abs = Math.abs,
                    opt = this.options,
                    isTouch = Utils.isTouch,
                    dragThresholdMet,
                    self = this,
                    rtime = new Date(),
                    timeout = false,
                    delta = 200,
                    dragging,
                    canceled,
                    xy,
                    dx,
                    dy;


                function start(e) {
                    if (!isTouch) e.preventDefault();

                    dragging = true;
                    canceled = false;

                    xy = Utils.getCursorPosition(e);
                    dx = 0;
                    dy = 0;
                    dragThresholdMet = false;
                }

                function drag(e) {
                    if (!dragging || canceled || self._needsUpdate) return;

                    var newXY = Utils.getCursorPosition(e);
                    dx = xy.x - newXY.x;
                    dy = xy.y - newXY.y;

                    if (dragThresholdMet || abs(dx) > abs(dy) && (abs(dx) > opt.dragRadius)) {
                        dragThresholdMet = true;
                        e.preventDefault();
                        if(self.options.drag){
                            self._offsetDrag = -dx;
                            self.update();
                        } else {
                            self._swipeOffset = -dx;
                        }
                    } else if ((abs(dy) > abs(dx)) && (abs(dy) > opt.dragRadius)) {
                        canceled = true;
                    }
                }

                function end(e) {

                    if (!dragging) {
                        return;
                    }

                    dragging = false;

                    //Bypass, fix for safari to top scrolling.
                    setTimeout(function(e){
                       _end(e);
                    },0);

                }

                function _end(e) {
                    if (!canceled && abs(dx) > opt.moveRadius) {
                        // Move to the next slide if necessary
                        if (dx > 0) {
                            self._swipeOffset = -(opt.moveRadius +1);
                            self.next();
                        } else {
                            self._swipeOffset = (opt.moveRadius +1);
                            self.prev();
                        }
                    } else {
                        // Reset back to regular position
                        self._offsetDrag = 0;
                        self.update();
                    }
                }

                function click(e) {
                    if (dragThresholdMet) e.preventDefault();
                }

                function resizeend() {
                    //workaround for multiple resize events.
                    if (new Date() - rtime < delta) {
                        setTimeout(resizeend, delta);
                    } else {
                        timeout = false;
                        //call the resize handler.
                        self.resize();
                    }
                }

                //bind swipe events
                this.$sliderList.on(Utils.events.down + '.ucarousel', start)
                    .on(Utils.events.move + '.ucarousel', drag)
                    .on(Utils.events.up + '.ucarousel', end)
                    .on('click.carousel', click)
                    .on('mouseout.carousel', end);


                //Call carousel resize while window is resized
                $(window)
                    .on('resize.ucarousel' + this.id(), function () {
                    rtime = new Date();
                    if (timeout === false) {
                        timeout = true;
                        setTimeout(resizeend, delta);
                    }
                })
                .on('orientationchange.ucarousel',function(){
                    self.resize();
                })
            };

            Carousel.prototype.update = function () {
                if (this._needsUpdate) {
                    return;
                }

                var self = this;
                this._needsUpdate = true;
                Utils.requestAnimationFrame(function () {
                    self._update();
                });
            }

            Carousel.prototype._update = function () {
                var leftOffset;
                if (!this._needsUpdate) {
                    return;
                }

                leftOffset = Math.round(this._startOffset + this._offset + this._offsetDrag);

                if(!this.options.loop && leftOffset < this.increment * -(this.numElmts-1)) {
                    leftOffset = this.increment * -(this.numElmts-1);
                }

                this.$sliderList[0].style.left = leftOffset + 'px';

                this._needsUpdate = false;
            }

            Carousel.prototype.next = function () {
                if (!this.isAnimating) {
                    if(!this.options.loop && this.firstElementOnViewPort == this.numElmts - this.shownInViewport+1 ){
                        this._lock = true;
                        this.$element.trigger('locked.ucarousel');
                    }else if (this.firstElementOnViewPort > this.numElmts) {
                        this.setLeft(this._startOffset + this._offsetDrag);
                        this.firstElementOnViewPort = 2;
                        this._offset = 0;

                    } else {
                        this.firstElementOnViewPort++;
                    }
                    var delta = this.getOffset();
                    if(!this.options.loop && delta < this.increment * -(this.numElmts-1)) {
                        delta = this.increment * -(this.numElmts-1);
                    }
                    this.animate(delta, 'next');
                }
            };

            Carousel.prototype.prev = function () {
                if (!this.isAnimating) {
                    if (this.firstElementOnViewPort == 1) {
                        if(!this.options.loop) {
                            this._lock = true;
                        }else {
                            this.setLeft("-" + ((this.numElmts * this.increment) - this._offsetDrag - this._startOffset));
                            this._offset = this.numElmts * this.increment;
                            this.firstElementOnViewPort = this.numElmts;
                        }
                    } else {
                        this.firstElementOnViewPort--;
                    }
                    this.animate(this.getOffset(true), 'prev');
                }
            };


            /*
             *   $(element).uCarousel(moveTo)
             *   @Description:- Jumps to the slide no "newSlide"
             *   @ param     :- slide number to jump to
             */
            Carousel.prototype.moveTo = function (newSlide) {
                var delta;
                if (!this.isAnimating) {
                    delta = this._startOffset - this.increment * (newSlide - 1);

                    this.firstElementOnViewPort = newSlide;

                    this.setLeft(delta);
                    this.isAnimating = false;
                    this._offset = -(this.increment * (newSlide - 1));
                    this.slideChange();
                }
            }

            Carousel.prototype.moveToNext = function () {
                this._swipeOffset = -(this.options.moveRadius +1);
                this.next();
            }
            Carousel.prototype.moveToPrev = function () {
                this._swipeOffset = +(this.options.moveRadius +1);
                this.prev();
            }

            Carousel.prototype.getOffset = function (prev) {
                var getDelta = function (n, mul, prev) {
                    if (prev) {
                        if (n > 0) return Math.floor(n / mul) * mul;
                        else if (n < 0) return Math.ceil(n / mul) * mul;
                        else return 0;
                    } else {
                        if (n > 0) return Math.ceil(n / mul) * mul;
                        else if (n < 0) return Math.floor(n / mul) * mul;
                        else return mul;
                    }
                };
                var offset = this.options.drag ? parseInt(this.$sliderList.css('left')) : parseInt(this.$sliderList.css('left')) + this._swipeOffset;
                return getDelta(offset, this.increment, prev);
            }

            /*
             *   $(element).uCarousel(resize)
             *   @Description:- Re-calculates the carousel, when the window gets resized.
             *                  Especially for mobile landscape and portrait view
             *   @ param     :- None
             */
            Carousel.prototype.resize = function () {
                var increment = this.$elmnts.outerWidth(true)
                    ,shownInViewport = Math.round(this.$element.width() / increment);
                //Don't do anything if the shownInViewport && increment are same after resize.
                if (shownInViewport === this.shownInViewport && this.increment === increment) {
                    return;
                }

                this.increment = increment;
                this.shownInViewport = shownInViewport;

                //if(this.options.loop){
                    //Remove extra items we added.
                    this.$sliderList.html(this.$elmnts);
                //}

                //Realign the carousel
                this.align();

                //Move to the slide which user was viewing
                this.moveTo(this.firstElementOnViewPort);
            }

            Carousel.prototype.animate = function (offset, callback) {
                var slideDuration = this.options.slideDuration;
                if(this._lock) {
                    this._offsetDrag = 0;
                    this.update();
                    this._lock = false;
                    return;
                }
                var self = this;
                this.$sliderList.animate({
                    left: offset,
                    y: 0,
                    queue: true
                }, slideDuration, function () {
                    self.callbacks(callback);
                });
                this.isAnimating = true;
                this._swipeOffset = 0;
            }

            Carousel.prototype.callbacks = function (callback) {
                var callbacks = {
                    prev: function (This) {
                        This.isAnimating = false;
                        This._offsetDrag = 0;
                        This._offset = This.getOffset(true) - This._startOffset;
                        This.slideChange();
                    },
                    next: function (This) {
                        This.isAnimating = false;
                        This._offset = This.getOffset() - This._startOffset;
                        var newSlide = This.firstElementOnViewPort > This.numElmts ? 1 : This.firstElementOnViewPort;
                        This.slideChange();
                    },
                    moveTo: function (This) {
                        This.isAnimating = false;
                        This._offset = This.getOffset(true);
                        This.slideChange();
                    }
                }
                return callbacks[callback](this);
            }

            Carousel.prototype.slideChange = function() {
              var slideInd = (this.getOffset(true)- this._startOffset) /this.increment,
                    where = '';
                    if (!this.options.loop) {
                        if (this.firstElementOnViewPort == this.numElmts - this.shownInViewport+1) {
                            where = 'last';
                        }
                        if (this.firstElementOnViewPort == 1) {
                            where = 'first';
                        }
                    }
              slideInd = (Math.abs(slideInd) % this.numElmts) + 1;
              this.$sliderList.trigger('slideChange.uCarousel', [slideInd,where]);
            }

            Carousel.prototype.unbind = function () {
                this.$sliderList.off('.ucarousel');
                $(window)
                    .off('.ucarousel' + this.id());
            }

            Carousel.prototype.destroy = function () {
                this.unbind();
                this.$element.trigger('destroy.ucarousel');
                this.$element.remove();

                // Cleanup
                this.$element = null;
                this.$inner = null;
                this.$start = null;
                this.$current = null;
            }

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
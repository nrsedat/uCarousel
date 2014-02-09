/* 
*	Tests for the uCarousel.
*	Required jQuery,uCarousel,qUnit
*	Author:- Ratheesh Naithalath
*/

module( "Utils module" );
test("Get propety test",function(){
	equal(uUtils.getProperty('TransitionDuration'),'WebkitTransitionDuration',"Expected WebkitTransitionDuration but was "+uUtils.getProperty('TransitionDuration'));
});

test("General vague module properties test",function(){
	ok(typeof uUtils.hasTouch);
	ok(typeof uUtils.events);
	ok(typeof uUtils.getCursorPosition);
	ok(typeof uUtils.setTransitions);
	ok(typeof uUtils.requestAnimationFrame);
	ok(typeof uUtils.getProperty);
});

module("uCarousel module");
test("Method check in jQuery prototype",function(){
	ok($.fn.uCarousel !== undefined,"uCarousel not added to jQuery prototype");
});

test("Chaining test",function(){
	var element = document.createElement('div');
	var returned = $(element).uCarousel();
	deepEqual(returned,$(element),'Chaining failed');
});
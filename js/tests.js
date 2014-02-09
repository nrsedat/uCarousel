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

test("Option setting test",function(){
	var element = document.createElement('div');
	$(element).uCarousel({slideDuration: 100});
	deepEqual(element._carousel.options.moveRadius,20,'Default setting failed');
	deepEqual(element._carousel.options.slideDuration,100,'Options setting failed');
});

test("Empty and id creation test",function(){
	var element = document.createElement('div'),element2 = document.createElement('div');
	$(element).uCarousel();
	ok(!element._carousel.id,"Id created for an empty carousel");

	$(element).append('<ul><li></li></ul>');
	$(element).uCarousel();
	ok(element._carousel.id,"Id created for an empty carousel");

	$(element2).append('<ul><li></li></ul>').uCarousel();
	notEqual(element._carousel.id,element2._carousel.id,"Multiple carousels with same id created");
});

asyncTest("Slide change test",function(){
	var element = document.createElement('div');
	$(element).append('<ul><li></li></ul>');
	$(element).on('slideChange.ucarousel',function(e,slide){
		equal(slide,1,"initial slide number update failed");
		start();
	});
	$(element).uCarousel();

});
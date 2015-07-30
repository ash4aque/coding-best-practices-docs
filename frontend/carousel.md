## Atlas Slick Carousels

This is a quick guide for explaining how to use the slick carousel in Atlas

### Table of Contents

* [Overview](#overview)
* [Controller](#controller)
* [Types](#types)
* [Converting](#converting)
* [Lazy Loading Images](#lazy-loading-images)
* [Responsive Breakpoints](#responsive-breakpoints)
* [Additional Settings](#additional-settings)

### Overview

The Slick carousel is an implementation of the SlickJS Library here: http://kenwheeler.github.io/slick/.
This is a good improvement over our old carousel library, which was all custom code that was
slower in general with navigation and swiping on mobile devices.

### Controller

There is a file called common/carousel-controller.js that can be used to convert the old carousel
library to the new slick library.
To init the controller, it needs four arguments passed in: version, type, element and settings.
The version is either 'old' or 'slick'. Old will instantiate the old carousel. Slick will apply the new slick library.
Type is either 'one-up', 'n-up', or 'n-up-vertical'. 
element is a *jquery element* that holds either the old carousel elements, or the to-be slick-ified carousel element.
settings are optional settings that can be used to override the default settings for a slick carousel, 
or additional settings for the old carousel implementation.
Note that if an unknown version or type is passed in, the controller will return null. 

### Types

There are three different types of carousels that we had with the old carousel: one-up, n-up and n-up-vertical.
In the new Slick world, making these types of carousels comes with default settings that can be optionally overridden
by passing in an additional setting argument into the carousel controller.

one-up will instantiate a carousel with one slide scrolling at a time with these default settings:
```
   slide: "li",
   speed: 300,
   dots: true,
   autoplay: true,
   autoplaySpeed: 5000
```
That is, one-up is infinite by default, and has pagination dots and autoplay of 5 seconds by default. 

n-up will instantiate a carousel with multiple slides scrolling at a time with these default settings:
```
  slide: "li",
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 4,
  dots: true,
  infinite: false
```
That is, n-up is not infinite scrolling, has pagination dots, and shows/scrolls 4 slides at a time by default.

n-up-vertical will instantiate a carousel with multiple slides vertically scrolling 
at a time with these default settings:
```
  slide: "li",
  speed: 300,
  slidesToShow: 4,
  slidesToScroll: 4,
  dots: true,
  infinite: false,
  vertical: true
```
That is, n-up-vertical is not infinite scrolling, has pagination dots, and shows/scrolls 4 slides at a time by default.

### Converting
Converting an old carousel implementation to the new slick implementation isn't hard. Here's an example.
```
  oneUp.init($homepage.find(".js-carousel-one-up"));
```
This is instantiating the old carousel implementation. 
Let's say you want to use the new carousel controller to instantiate it instead. You would have this.
```
  carouselController.init("old", "one-up", $homepage.find(".js-carousel-one-up"), {});
```
These are equivalent. Now let's say you want to make this one-up carousel use Slick. You would do this:

```
  carouselController.init("slick", "one-up", $homepage.find(".js-carousel-one-up"), {});
```
This would use the default settings for the one-up carousel. If you wanted to customize it further, you can do this:
```
  carouselController.init("slick", "one-up", $homepage.find(".js-carousel-one-up"), {
     autoplay: true,
     autoplaySpeed: 10000,
     infinite: false
  });
```
This would create a one-up carousel that doesn't have infinite scroll 
and autoplay rotation speed of 10 seconds per slide. 

Here's another example for an n-up carousel.
```
  nUp.init($homepage.find(".js-carousel-n-up"));
```
This is instantiating the old carousel implementation. 
Let's say you want to use the new carousel controller to instantiate it instead. You would have this.
```
  carouselController.init("old", "n-up", $homepage.find(".js-carousel-n-up"), {});
```
These are equivalent. Now let's say you want to make this one-up carousel use Slick. You would do this:

```
  carouselController.init("slick", "n-up", $homepage.find(".js-carousel-n-up"), {});
```
This would use the default settings for the n-up carousel. If you wanted to customize it further, you can do this:
```
  carouselController.init("slick", "n-up", $homepage.find(".js-carousel-n-up"), {
    slidesToShow: 7,
    slidesToScroll: 7,
    infinite: true
  });
```
This would create a n-up carousel that has infinite scroll and displays/scrolls 7 slides at a time.

To see fully converted n-up carousels in action, take a look at homepage/views/Homepage/js/homepage-init.js
and atlas-core/src/main/webapp/global/views/modules/js/category-init.js

### Lazy Loading images

Slick supports lazy loading images out of the box. There are a few minor changes to be made, however. 
To enable lazy loading images, the src attribute of the img tag has to be converted to a data-lazy attribute instead.

So in your handlebars template, instead of this
```
   <img class="product-image js-product-image tile-row img-hide-alt" src="{{protocolRelativeLink imageSrc}}" alt="{{productName}}" />
```
You would change it to this
```
   <img class="product-image js-product-image tile-row img-hide-alt" data-lazy="{{protocolRelativeLink imageSrc}}" alt="{{productName}}" />
```
Just a simple one line change in your hbs template. 

### Responsive Breakpoints

Slick also supports responsive breakpoints out of the box. 
They are by default configured like thus:
```
 responsive: [
        {
          breakpoint: 1273,
          settings: {
            slidesToShow: 6,
            slidesToScroll: 6,
            dots: true,
            infinite: false,
            variableWidth: true
          }
        },
        {
          breakpoint: 1091,
          settings: {
            slidesToShow: 5,
            slidesToScroll: 5,
            dots: true,
            infinite: false,
            variableWidth: true
          }
        },
        {
          breakpoint: 909,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4,
            dots: true,
            infinite: false,
            variableWidth: true
          }
        },
        {
          breakpoint: 727,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            dots: true,
            infinite: false,
            variableWidth: true
          }
        },
        {
          breakpoint: 545,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            dots: true,
            infinite: false,
            variableWidth: true
          }
        },
        {
          breakpoint: 363,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            infinite: false,
            variableWidth: true
          }
        }
      ]
```
These responsive breakpoints should work so long as all our carousel slides have the same width. 
You can configure as many breakpoints as you want, as each breakpoint has its own slick settings. 
You can also add custom css to your classes to style your carousels even further.

### Additional Settings

For the full Slick settings, Take a look at the full Slick documentation here: http://kenwheeler.github.io/slick/
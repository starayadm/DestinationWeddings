// Object-fit polyfill

objectFitImages();

// Lazyload polyfill

var lazyLoadInstance = new LazyLoad({
	elements_selector: ".lazy"
});

// Swiper.js slider

var swiper = new Swiper('.swiper-container', {
	lazy: true,
	slidesPerView: 1,
  spaceBetween: 60,
	loop: true,
	effect: 'flip',
	flipEffect: {
    slideShadows: false,
  },
	grabCursor: true,
	autoHeight: true,
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	pagination: {
		el: '.swiper-pagination',
		clickable: true,
		renderBullet: function (index, className) {
			return '<span class="' + className + '">' + '</span>';
		},
	},
});


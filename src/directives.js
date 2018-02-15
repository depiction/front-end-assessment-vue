import Vue from 'vue'
import 'intersection-observer';

Vue.directive('lazy-load', {
	// When the bound element is inserted into the DOM...
	bind: function (el) {
		const config = {
			rootMargin: '100% 0px'
		};

		let observer = new IntersectionObserver(function (entries, self) {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					preloadImage(entry.target);
					observer.unobserve(entry.target);
				}
			});
		}, config);

		observer.observe(el);
	}
})

function preloadImage(img) {
	const src = img.getAttribute('data-src');
	if (!src) { return; }
	img.src = src;
}

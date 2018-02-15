import Vue from 'vue'
import 'intersection-observer';

Vue.directive('lazy-load', {
	bind (el) {
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

let preloadImage = ((img) => {
	const src = img.getAttribute('data-src');
	if (!src) { return; }
	img.src = src;
})

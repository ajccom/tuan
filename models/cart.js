var myApp = myApp || {};

myApp.cart = {
	ini: function () {}
};

D1ma.model['cart'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.cart.ini();
	}
};
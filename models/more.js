var myApp = myApp || {};

myApp.more = {
	ini: function () {
		new iScroll('more-wrapper', {vScrollbar: false});
	}
};

D1ma.model['more'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.more.ini();
	}
};
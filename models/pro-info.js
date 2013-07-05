var myApp = myApp || {};

myApp.proInfo = {
	ini: function () {}
};

D1ma.model['pro-info'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.proInfo.ini();
		new iScroll('pro-info-wrapper', {vScrollbar: false});
		myApp.proInfo.scrollObj = new S.Carousel('.pro-info .carousel', 'kv');
	}
};
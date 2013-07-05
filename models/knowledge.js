var myApp = myApp || {};

myApp.knowledge = {
	ini: function () {
		new iScroll('knowledge-wrapper', {vScrollbar: false});
	}
};

D1ma.model['knowledge'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.knowledge.ini();
	}
};
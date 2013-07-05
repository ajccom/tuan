var myApp = myApp || {};

myApp.knowledgeInfo = {
	ini: function () {
		new iScroll('knowledge-info-wrapper', {vScrollbar: false});
	}
};

D1ma.model['knowledge-info'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.knowledgeInfo.ini();
	}
};
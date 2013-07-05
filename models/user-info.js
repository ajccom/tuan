var myApp = myApp || {};

myApp.userInfo = {
	ini: function () {
		new iScroll('user-info-wrapper', {
			vScrollbar: false,
			useTransform: false,
			onBeforeScrollStart: function (e) {
				var target = e.target;
				while (target.nodeType != 1) target = target.parentNode;
				if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
					e.preventDefault();
				}
			}
		});
	}
};

D1ma.model['user-info'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.userInfo.ini();
	}
};
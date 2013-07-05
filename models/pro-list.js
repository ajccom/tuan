var myApp = myApp || {};

myApp.proList = {
	bind: function () {
		$('.pro-list .rank-bar ul li:first').on(S.event.mouseup, function () {
			if ($(this).hasClass('current')) {
				$(this).removeClass('current');
			} else {
				$(this).addClass('current');
			}
			return false;
		});
		$('.pro-list .rank-bar ul ul li').on(S.event.mousedown, function () {
			$('.pro-list .rank-bar ul ul li').removeClass('current');
			$(this).addClass('current');
			return false;
		});
	},
	ini: function () {
		this.bind();
	}
};

D1ma.model['pro-list'] = {
	data: {},
	beforeload: function () {},
	load: function () {
		myApp.proList.ini();
		new iScroll('pro-list-wrapper', {vScrollbar: false});
	}
};
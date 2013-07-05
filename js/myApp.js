var myApp = myApp || {};

myApp.bind = function () {
	var a = $('footer li a');
	a.on(S.event.mouseup, function () {
		a.removeClass('current');
		$(this).addClass('current');
	});
};

myApp.ini = function () {
	myApp.bind();
	//D1ma.currentEffect = 'slide';
	location.hash = '#pro-list';
};

$(function () {
	myApp.ini();
});

M.ready(function () {
	M.event.bind('backbutton', function () {
		M.ntf.confirm('是否退出', function (buttonIndex) {
			if (buttonIndex == 1) {
				M.exit();
			}
		}, '应用程序', '确定,取消');
	});
});
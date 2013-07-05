//@namespace S, $, jQuery, M, iScroll
var S = S || {};

S.baseUrl = 'http://58.247.89.34:8008';
//S.baseUrl = 'http://192.168.1.240';

S.getDate = function (date) {
	var time = {},
		date = new Date(date);
	time.year = date.getFullYear();
	time.month = date.getMonth() + 1;
	time.date = date.getDate();
	time.day = '星期' + '天一二三四五六'.charAt(date.getDay());
	return time;
};

S.ua = navigator.userAgent;
S.platform = {};//use in mobile device
if (S.ua.toLowerCase().indexOf('android') > -1) {
	S.platform.os = 'Android';
	S.platform.isAndroid = true;
	S.platform.version = (S.ua.match(/[\/\(; ]Android[\/: ](\d+\.\d+)[\.;\- ]/i) || [0,'0'])[1];
} else if (S.ua.match(/\(i(?:phone|pod|pad);/i)) {
	S.platform.os = 'iOS';
	S.platform.isIOS = true;
	S.platform.version = (S.ua.match(/[\/; ]OS[\/: _](\d+(?:[\._]\d+)?)[\._; ]/i) || [0,'0'])[1].replace('_', '.');
	if (S.ua.match(/\(ipad;/i)) {
		S.platform.device = 'ipad';
	} else if (S.ua.match(/\(iphone;/i)) {
		S.platform.device = 'iphone';
	} else if (S.ua.match(/\(ipod;/i)) {
		S.platform.device = 'ipod';
	}
}

S.event = {
	mousedown: S.platform.os ? 'touchstart' : 'mousedown',
	mouseup: S.platform.os ? 'touchend' : 'mouseup',
	mousemove: S.platform.os ? 'touchmove' : 'mousemove'
};

/*
	S.mask.show()
	S.mask.hide()
*/
S.mask = {
	create: function () {
		var html = '<div class="cmMask"></div>';
		$('body').append(html);
		this.mask = $('.cmMask');
	},
	show: function (fn) {
		this.mask.height(document.body.scrollHeight).show();
		$('input').hide();
		if (fn) {
			fn();
		}
	},
	hide: function (fn) {
		this.mask.hide();
		$('input').show();
		if (fn) {
			fn();
		}
	},
	ini: function () {
		this.create();
	}
};

/*
	S.loading.show()
	S.loading.hide()
*/
S.loading = {
	create: function () {
		var html = '<div class="cmLoading"><img src="img/loading.gif" /></div>';
		$('body').append(html);
		this.loading = $('.cmLoading');
	},
	show: function () {
		S.mask.show();
		this.pos();
		$('input').hide();
		this.loading.show();
	},
	hide: function () {
		S.mask.hide();
		$('input').show();
		this.loading.hide();
	},
	pos: function () {
		var l = (document.body.clientWidth - this.loading.outerWidth())/2;
		var t = (document.body.clientHeight * 0.95 - this.loading.outerHeight())/2;
		l = (l < 0) ? 0 : l;
		t = (t < 0) ? 0 : t;
		this.loading.css({
			left: (l + document.body.scrollLeft) + 'px',
			top: (t + document.body.scrollTop) + 'px'
		});
	},
	ini: function () {
		this.create();
	}
};

S.validation = function(eInput, rules) {
	this.$input = eInput instanceof $ ? eInput : $(eInput);
	this.rules = rules;
	this.delayCheck = false;
	this.waitingChecks = [];
	this.ini();
};

S.validation.prototype = {
	regs: {
		email: /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i,
		phone: /^\d{11}$/
	},
	requiredCheck: function() {
		if (this.$input.attr('type') === 'checkbox') {
			if (this.$input[0].checked) {
				return true;
			} else {
				this.errorText = this.rules.required[1];
				return false;
			}
		} else {
			if (this.currentVal.length > 0) {
				return true;
			} else {
				this.errorText = this.rules.required[1];
				return false;
			}
		}
	},
	sizeCheck: function() {
		var len = this.currentVal.length;
		if (len < this.rules.size[0] || len > this.rules.size[1]) {
			this.errorText = this.rules.size[2];
			return false;
		} else {
			return true;
		}
	},
	equalCheck: function() {
		var value = this.rules.equal[0].val();
		if (this.currentVal === value) {
			return true;
		} else {
			this.errorText = this.rules.equal[1];
			return false;
		}
	},
	emailCheck: function() {
		if (this.regs.email.test(this.currentVal)) {
			return true;
		} else {
			this.errorText = this.rules.email[1];
			return false;
		}
	},
	phoneCheck: function() {
		if (this.regs.phone.test(this.currentVal)) {
			return true;
		} else {
			this.errorText = this.rules.phone[1];
			return false;
		}
	},
	regexCheck: function() {
		if (this.rules.regex[0].test(this.currentVal)) {
			return true;
		} else {
			this.errorText = this.rules.regex[1];
			return false;
		}
	},
	setRemoteParams: function() {
		var that = this, params = this.rules.remote[0], ajaxParams = {
			type: 'GET',
			url: '',
			dataType: "json",
			success: function(result) {
				if (result.status) {
					that.ok();
				} else {
					that.errorText = that.rules.remote[1];
					that.error();
				}
			}
		};
		if (typeof params === 'object') {
			jQuery.extend(ajaxParams, params);
			jQuery.each(ajaxParams.data, function(key, item) {
				if (item === '${value}') {
					that.remoteDataKey = key;
				}
			});
		}
		this.remoteParams = ajaxParams;
	},
	remoteCheck: function() {
		this.delayCheck = true;
		var params = this.rules.remote[0];
		if (typeof params === 'string') {
			this.remoteParams.url = params + this.currentVal + '?' + (new Date()).getTime();
		} else {
			this.remoteParams.data[this.remoteDataKey] = this.currentVal;
		}
		jQuery.ajax(this.remoteParams);
		return true;
	},
	ok: function() {
		this.checkResult = true;
	},
	error: function() {
		//M.ntf.alert(this.errorText, null, '验证信息', '确定');
		this.checkResult = false;
	},
	check: function() {
		var i, len = this.waitingChecks.length, value = this.$input.val();
		this.currentVal = this.$input.attr('type') === 'password' ? value : jQuery.trim(value);
		if (this.currentVal.length > 0 || jQuery.inArray('requiredCheck', this.waitingChecks) > -1) {
			for (i = 0; i < len; i++) {
				if (this[this.waitingChecks[i]] && !this[this.waitingChecks[i]]()) {
					this.error();
					return;
				}
			}
			if (!this.delayCheck) {
				this.ok();
			}
		} else {
			this.checkResult = true;
		}
	},
	focus: function(value) {
		this.focusValue = value;
	},
	bind: function() {
		var that = this;
		if (this.$input.attr('type') === 'checkbox') {
			this.$input.change(function() {
				that.check();
			});
		} else {
			this.$input.bind({
				focus: function() {
					that.focus(this.value);
				},
				blur: function() {
					if (that.focusValue && that.focusValue === this.value && !that.$input.attr('vaild-equal')) {
						return;
					} else {
						that.check();
					}
				}
			});
		}
	},
	config: function() {
		var key;
		for (key in this.rules) {
			if (key !== 'ok' || key !== 'note') {
				this.waitingChecks.push(key + 'Check');
			}
		}
		if (this.rules.remote) {
			this.setRemoteParams();
		}
		if (this.rules.equal) {
			this.$input.attr('vaild-equal', true);
		}
	},
	ini: function() {
		this.config();
		this.bind();
	}
};

//S.ajax(arg);
S.ajax = function (arg) {
	$.ajax({
		type: 'POST',
		data: arg.data,
		url: arg.url,
		dataType: 'json',
		success: arg.success,
		timeout: 30000,
		error: function (xhr, status) {
			if (arg.error) {
				arg.error(xhr, status);
			}
			S.loading.hide();
			M.ntf.alert('服务器请求失败了');
		}
	});
};

//S.Carousel(DOM, arg);
S.Carousel = function (jEle, id, arg) {
	this.wrapper = typeof jEle === 'string' ? $(jEle) : jEle;
	this.scrollerId = id;
	this.scroller = this.wrapper.find('#' + id);
	this.extend(arg);
	this.ini();
};

S.Carousel.prototype = {
	config: {
		showArr: true,
		showIcon: true //show icons
	},
	extend: function (arg) {
		arg = arg || {};
		this.cfg = $.extend({}, this.config, arg);
	},
	create: function () {
		if (this.scroller[0]) {
			var li = this.scroller.find('li'),
				w = this.scroller.width(),
				num = li.length,
				html = [],
				i = 0;
			this.scroller.children().width(w * num);
			li.width(w);
			if (this.cfg.showIcon) {
				html.push('<ul class="carousel-icons-list">');
				for (i; i < num; i++) {
					html.push('<li>' + i + '</li>');
				}
				html.push('</ul>');
				this.wrapper.append(html.join(''));
				this.icons = this.wrapper.parent().find('.carousel-icons-list li');
			}
			if (this.cfg.showArr) {
				this.wrapper.append('<div class="carousel-prev">prev</div><div class="carousel-next">next</div>');
				var p = this.wrapper.parent();
				this.prev = p.find('.carousel-prev');
				this.next = p.find('.carousel-next');
			}
			this.handle();
		}
	},
	refresh: function () {
		if (this.scrollObj && this.scrollObj.refresh) {
			this.scrollObj.refresh();
		}
	},
	handle: function () {
		var that = this;
		this.scrollObj = new iScroll(this.scrollerId, {
			snap: this.cfg.snap || true,
			momentum: this.cfg.momentum || false,
			hScrollbar: this.cfg.hScrollbar || false,
			onScrollEnd: function () {
				that.icons.filter('.active').removeClass('active');
				that.icons.eq(this.currPageX).addClass('active');
			}
		});
		
		this.icons.eq(0).addClass('active');
		
		this.next.on(S.event.mouseup, function () {
			that.scrollObj.scrollToPage('next', 0);
		});
		this.prev.on(S.event.mouseup, function () {
			that.scrollObj.scrollToPage('prev', 0);
		});
	},
	ini: function () {
		this.create();
	}
};
            
$(function () {
	S.mask.ini();
	S.loading.ini();
});
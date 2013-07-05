var D1ma = D1ma || {};

D1ma.config = {
	pageWrapperId: 'page-wrapper',
	modelPath: 'models/',
	htmlPath: ''
};
/**
*	route - use hash to get which html load
*/
D1ma.route = {
	routeObj: {},
	add: function (hash, route, callback) {
		this.routeObj[hash] = {
			route: route,
			callback: callback// when load html, before beforeload
		}
	},
	del: function (hash) {
		delete this.routeObj[hash];
	},
	get: function (hash) {
		if (this.routeObj[hash]) {
			return this.routeObj[hash];
		} else {
			return {
				route: hash + '.html'
			}
		}
	},
	set: function (hash, route, callback) {
		if (this.routeObj[hash]) {
			this.routeObj[hash] = {
				route: route,
				callback: callback
			}
		}
	}
};

D1ma.tmpl = (function(){
  D1ma.replace = function tmpl(str, data){
   // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = 
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
       
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
       
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
	  
    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  };
}());

//save templates for pages
D1ma.templates = {};

D1ma.load = function (hash) {
	var routeObj = D1ma.route.get(hash);
	var obj = null;
	if (location.hash !== '#' + hash) {
		//location.hash = '#' + hash; //@ webview in phonegap, this will trigger hashChange
	}
	if (D1ma.currentPage) {
		D1ma.prevPage = D1ma.currentPage.removeClass('current').addClass('prev-page');
	}
	if (!$('.D1maTempPage.sub-page-' + hash)[0]) {
		obj = $('<div class="D1maTempPage current ' + D1ma.currentEffect + '"></div>').hide().addClass('current');
		$.ajax({
			type: 'GET',
			dataType: 'html',
			url: D1ma.config.htmlPath + routeObj.route,
			success: function (html) {
				D1ma.templates[hash] = html;
				if (routeObj.callback) {
					routeObj.callback(html);
				}
				D1ma.currentPage = obj;
				obj.addClass('sub-page-' + hash);
				$('body').append('<script src="' + D1ma.config.modelPath + hash + '.js"></script>');
				D1ma.pageDataIni(hash, html);
				D1ma.effect.run();
			},
			error: function () {
				console.log('error: D1ma.load - ' + D1ma.config.htmlPath + routeObj.route + '.');
				S.loading.hide();
			}
		});
	} else {
		var html = D1ma.templates[hash],
			d = D1ma.model[hash] || '';
		D1ma.currentPage = obj = $('.D1maTempPage.sub-page-' + hash);
		if (d && d.beforeload) {
			d.beforeload();
		}
		if (d && d.data) {
			html = D1ma.replace(html, d.data);
		}
		obj.html(html).addClass('current');
		if (d && d.load) {
			d.load();
		}
		D1ma.effect.run();
	}
	D1ma.isBack = 0;
};

D1ma.updatePage = function () {
	var hash = location.hash.split('#')[1],
		html = D1ma.templates[hash],
		d = D1ma.model[hash] || '';
	if (d && d.beforeload) {
		d.beforeload();
	}
	if (d && d.data) {
		html = D1ma.replace(html, d.data);
	}
	D1ma.currentPage.html(html).addClass('current');
	if (d && d.load) {
		d.load();
	}
};

D1ma.reload = function () {
	D1ma.load(location.hash.split('#')[1]);
};

D1ma.model = {
/*	['hash']: {
		data: {username: XXXX // replace {{username}} -> XXXX}
		load: {},//show
		beforeload: function () {}//haven't show
	}*/
};

D1ma.pageDataIni = function (hash, html) {
	var d = D1ma.model[hash] || '';
	if (d && d.beforeload) {
		d.beforeload();
	}
	if (d && d.data) {
		html = D1ma.replace(html, d.data);
	}
	D1ma.currentPage.html(html);
	D1ma.currentPage.appendTo('#' + D1ma.config.pageWrapperId).show();
	if (d && d.load) {
		d.load();
	}
};

D1ma.hashHandler = {
	bind: function () {
		window.onhashchange = function () {
			if ($('iframe')[0]) {return}
			var str = location.hash.split('#')[1] || 'search-list';
			D1ma.load(str);
		}
		/*$(document).on('click', '.back', function () {
			D1ma.isBack = 1;
			history.go(-1);
		});*/
	},
	ini: function () {
		this.bind();		
	}
};

D1ma.currentPage = null; //jQuery Object, current show page
D1ma.currentEffect = 'normal';
D1ma.effect = {
	run: function () {
		//handle trans effect
		var currentEffect = D1ma.effect[D1ma.currentEffect],
			currentPage = D1ma.currentPage,
			t = D1ma.currentEffect === 'normal' ? 0 : 400;
		currentPage.removeClass(currentEffect.prev + ' ' + currentEffect.next);
		if (D1ma.isBack) {//when go back
			currentPage.addClass(currentEffect.prev);
			setTimeout(function () {
				currentPage.removeClass(currentEffect.prev + ' prev-page');
				D1ma.prevPage.removeClass('prev-page');
			}, t);
		} else {
			currentPage.addClass(currentEffect.next);
			if (D1ma.prevPage) {
				setTimeout(function () {
					D1ma.prevPage.removeClass(currentEffect.next + ' prev-page');
				}, t);
			}
		}
		S.loading.hide();
	},
	normal: {
		prev: '',
		next: ''
	},
	slide: {
		prev: 'in reverse',
		next: 'in'
	},
	fade: {
		prev: 'out',
		next: 'in'
	},
	pop: {
		prev: 'in reverse',
		next: 'in'
	},
	slidefade: {
		prev: 'in reverse',
		next: 'in'
	},
	slidedown: {
		prev: 'in reverse',
		next: 'in'
	}
};

D1ma.hashHandler.ini();


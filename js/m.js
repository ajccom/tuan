//@namespace M
var M = {};

//check if device ready
M.isReady = false;

M.rootPath = 'file:///mnt/sdcard/';
M.cachePath = M.rootPath + 'Android/data/com.example.bangteacher/cache/';

M.corsCheck = function () {//CORS（跨域资源共享） http://blog.csdn.net/hfahe/article/details/7730944
	var xhr = new XMLHttpRequest(),
		result = false;
	if ('withCredentials' in xhr) {
		result = true;
	} else if (typeof XDomainRequest != 'undefined') {
		result = true;
	}
	return result;
};

M.extend = function () {
	var first = arguments[0],
		len = arguments.length,
		prop = null,
		temp = null,
		i = 0;
	if (len <= 1) {return}
	for (i = 1; i < len; i++) {
		temp = arguments[i];
		for (prop in temp){
			first[prop] = temp[prop];
		}
	}
	return first;
};

M.ready = function (callback) {
	document.addEventListener('deviceready', function () {
		M.isReady = true;
		callback();
	}, false);
	//BlackBerry (OS 4.6) RIM的BrowserField(网页浏览器视图)不支持自定义事件，所以deviceready事件不会被触发
	/*var intervalID = setInterval ( function () {
		if (PhoneGap.available) {
			clearInterval (intervalID);
			//callback();
		}
	},500);*/
};

/*
	@M.exit();
*/
M.exit = function () {
	navigator.app.exitApp();
};

/*
	@M.camera.useCamera(function () {alert('my photo get it')}, {quality: 10})
	@M.camera.useAlbum(function (d) {alert('my photo data:' + d);});
*/
M.camera = {
	_imgPath: M.rootPath + 'DCIM/cc/',
	sourceType: {
		'0': 'PHOTOLIBRARY',
		'1': 'CAMERA',
		'2': 'SAVEDPHOTOALBUM'
	},
	defCfg: {
		quality : 45,//苹果中设定值必须在50以下
		destinationType : 1,//0 base64, 1 URI
		sourceType : 1,//1 camera, 0 PHOTOLIBRARY, 2 SAVEDPHOTOALBUM (安卓中0和2无区别)
		allowEdit : true,//只有苹果支持，无害
		//encodingType : Camera.EncodingType.JPEG,
		targetWidth : 1600,//减少像素输出，以targetWidth、targetHeight中值小者为等比缩放的参照项
		targetHeight : 1600,
		correctOrientation: true,
		saveToPhotoAlbum: false
	},
	_fail: function (msg) {
		//alert('camera error:' + msg);
	},
	_handleCfg: function (arg) {
		return M.extend({}, this.defCfg, arg);
	},
	_camera: function (callback, arg) {
		arg = this._handleCfg(arg);
		arg.sourceType = Camera.PictureSourceType[this.sourceType[arg.sourceType]];
		navigator.camera.getPicture(callback, this._fail, arg);
	},
	cleanup: function (callback) {//清空临时照片，IOS可用
		navigator.camera.cleanup(callback, this._fail);
	},
	useCamera: function (callback, arg) {
		arg = M.extend(arg || {}, {sourceType: 1});
		return this._camera(callback, arg);
	},
	useAlbum: function (callback, arg) {
		arg = M.extend(arg || {}, {sourceType: 0});
		return this._camera(callback, arg);
	}
};

/*
	@M.media.get('aaa.wav', function () {alert('load success')});
*/
M.media = {
	_mediaPath: M.rootPath + 'media/',
	_fail: function () {
		//alert('camera error:' + msg);
	},
	get: function (src, callback, arg) {
		var that = this,
			m = new Media(src, callback, this._fail, function (s) {
				that.statusChange(m, s, arg);
			});
		return m;
		/*
			@play()
			@pause()
			@stop()
			@release() //释放资源 *release是一个用于释放系统音频资源的同步函数。该函数对于Android系统尤为重要，因为Android系统的OpenCore（多媒体核心）的实例是有限的。开发者需要在他们不再需要相应Media资源时调用“release”函数释放它
			@getCurrentPosition(callback) //返回一个音频文件的当前位置
			@getDuration() //返回一个音频文件的总时长
			@seekTo(time) //音频播放至time处 eg: seekTo(10000) 10秒处播放
			@startRecord() 开始录音 //IOS下，用于录制的文件必须已经存在并是.wav类型，可以通过File API来进行文件的创建。
			@stopRecord()
		*/
	},
	play: function (src, arg) {
		var m = null,
			that = this;
		m = new Media(src, function () {}, this._fail, function (s) {
			that.statusChange(m, s, arg);
		}),
		m.play();
	},
	statusChange: function (m, s, arg) {
		var nofind = arg ? (arg.nofind || '') : '',
			start = arg ? (arg.start || '') : '',
			run = arg ? (arg.run || '') : '',//as test, no running status
			pause = arg ? (arg.pause || '') : '',
			end = arg ? (arg.end || '') : '';
		switch (s) {
			case 0: 
				if (nofind) {nofind()};
				alert('no find audio');
				m.release();
				break;
			case 1:
				if (start) {start(m)};
				break;
			case 2:
				if (run) {run(m)};
				break;
			case 3:
				if (pause) {pause(m)};
				break;
			case 4:
				if (end) {end(m)};
				m.release();
				break;
		};
	}
};

/*
	@M.am.get(function (d) {alert(d.x)});
	@M.am.watch(function (d) {alert(d.y)}, 3000);
	@M.am.stop();
*/
M.am = {//[a]ccelero[m]eter 加速计
	watchId: null,
	_fail: function () {
		//alert('Accelerometer error:' + msg);
	},
	get: function (fn) {//iPhone没有获取在任何给定点当前加速度数据的概念。你必须通过给定时间间隔查看加速度并获得数据。因此，getCurrentAcceleration函数会返回从phoneGap watchAccelerometer调用开始后的最近一个返回值。
		navigator.accelerometer.getCurrentAcceleration(fn, this._fail);
	},
	watch: function (fn, time) {
		time = time || 1000;
		this.watchId = navigator.accelerometer.watchAcceleration(fn, this._fail, {frequency: time});
	},
	stopWatch: function (time, fn) {
		if (!time) {
			navigator.accelerometer.clearWatch(this.watchId);
			this.watchId = null;
		} else {
			var that = this;
			setTimeout(function () {
				navigator.accelerometer.clearWatch(that.watchId);
				that.watchId = null;
				if (fn) {
					fn();
				}
			}, time);
		}
	}
};

/*
	@M.compass.get(function (d) {alert(a.magneticHeading);});
	@M.compass.watch(function () {}, 1000);
	@M.compass.stopWatch();
	@M.compass.filter(function (d) {alert('filter success')}, 30);
	@M.compass.stopFilter()
*/
M.compass = {
	watchId: null,
	filterId: null,
	_fail: function () {
		//alert('Compass error:' + msg);
	},
	get: function (fn) {
		navigator.compass.getCurrentHeading(fn, this._fail);
	},
	watch: function (fn, time) {
		time = time || 1000;
		this.watchId = navigator.compass.watchHeading(fn, this._fail, {frequency: time});
	},
	filter: function (fn, val) {//val - [0, 359.99] ****only iphone can use this function****
		val = val || 30;
		this.filterId = navigator.compass.watchHeadingFilter(fn, this._fail, {filter: val});
	},
	stopWatch: function (time, fn) {
		if (!time) {
			navigator.compass.clearWatch(this.watchId);
			this.watchId = null;
		} else {
			var that = this;
			setTimeout(function () {
				navigator.compass.clearWatch(that.watchId);
				that.watchId = null;
				if (fn) {
					fn();
				}
			}, time);
		}
	},
	stopFilter: function (time, fn) {
		if (!time) {
			navigator.compass.clearWatchFilter(this.filterId);
			this.filterId = null;
		} else {
			var that = this;
			setTimeout(function () {
				navigator.compass.clearWatchFilter(that.filterId);
				that.filterId = null;
				if (fn) {
					fn();
				}
			}, time);
		}
	}
};

/*
	@M.connection.check()
*/
M.connection = {
	check: function () {
		var networkState = navigator.connection.type,
			states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.NONE]     = '';
		return states[networkState];
	}
};

/*
	@M.device.getList(); //return html code
	@M.device.getName();
	@M.device.getPhoneGap();
	@M.device.getPlatform();
	@M.device.getUuid();
	@M.device.getVersion();
*/
M.device = {
	getList: function () {
		var str = [
			'Device Name: '  + device.name,
			'Device PhoneGap: ' + device.phonegap || device.cordova,
			'Device Platform: ' + device.platform,
			'Device UUID: ' + device.uuid,
			'Device Version: ' + device.version
		];
		return str.join('<br />');
	},
	getName: function () {
		return device.name;
	},
	getPhoneGap: function () {
		return device.phonegap || device.cordova;
	},
	getPlatform: function () {
		return device.platform;
	},
	getUuid: function () {
		return device.uuid;
	},
	getVersion: function () {
		return device.version;
	}
};

/*
	@M.event.getList() //return html code
	@M.event.bind('backbutton', function () {});
*/
M.event = {
	getList: function () {
		var html = [],
			str = '',
			d = {
				'backbutton': {
					os: 'Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当用户在Android系统上点击后退按钮的时候触发此事件。'
				},
				'batterycritical': {
					os: 'iOS || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序发现电池电量降低到临界点时会触发此事件。'
				},
				'batterylow': {
					os: 'iOS || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序发现电池降到一个较低水平值时触发此事件。'
				},
				'batterystatus': {
					os: 'iOS || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序发现电池状态发生改变时触发此事件。'
				},
				'deviceready': {
					os: 'iPhone || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap被完全加载后会触发该事件。'
				},
				'menubutton': {
					os: 'Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当用户在Android系统上点击菜单按钮的时候触发此事件。'
				},
				'startcallbutton': {
					os: 'BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当用户按下通话按钮时会触发该事件。'
				},
				'endcallbutton': {
					os: 'BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当用户按下挂机按钮时会触发该事件。'
				},
				'volumedownbutton': {
					os: 'BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当用户按下减小音量按钮时会触发该事件。'
				},
				'volumeupbutton ': {
					os: 'BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当用户按下加大音量按钮时会触发该事件。'
				},
				'pause': {
					os: 'iPhone || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序被放到后台的时候触发此事件。'
				},
				'resume': {
					os: 'iPhone || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序被恢复到前台运行的时候触发此事件。'
				},
				'online': {
					os: 'iPhone || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序在线（连接到因特网）的时候触发此事件。'
				},
				'offline': {
					os: 'iPhone || Android || BlackBerry WebWorks (OS 5.0 或更高)',
					des: '当PhoneGap应用程序离线（没有连接到因特网）的时候触发此事件。'
				},
				'Searchbutton': {
					os: 'Android',
					des: '当用户在Android系统上点击搜索按钮的时候触发该事件。'
				}
			};
		html.push('<ul>');
		for (ename in d) {
			str = '<li>event: <b>' + ename + '</b>,<br />os: ' + d[ename].os + ',<br />描述：' + d[ename].des + '</li>';
			html.push(str);
		}
		html.push('</ul>');
		return html.join('');
	},
	bind: function (type, fn) {
		if (type !== 'batterycritical' && type !== 'batterylow' && type !== 'batterystatus') {
			document.addEventListener(type, fn, false);
		} else {
			window.addEventListener(type, fn, false);
		}
	}
};

/*
	@M.gps.get(function (p) {}, {maximumAge: 1000, timeout: 1000});
	@M.gps.watch(function (p) {});
	@M.gps.stopWatch(3000, function () {});
	@M.gps.getList(p);
	返回数据的使用方式：
		p.coords.latitude 纬度
		p.coords.longitude 经度
		p.coords.altitude 海拔
		p.coords.accuracy 准确性
		p.coords.altitudeAccuracy 海拔准确性 -设备上不支持该属性，返回值总是null。
		p.coords.heading 角度
		p.coords.speed 速度
		p.timestamp 获取时间
*/
M.gps = {
	watchId: null,
	_fail: function () {
		//alert('GPS error:' + error.message);
	},
	defCfg: {
		enableHighAccuracy: true,//除非enableHighAccuracy选项被设定为true，否则Android 2.X模拟器不会返回一个地理位置结果。
		//timeout: 10000, //设定超时时间，超时后将返回一个ERROR对象实例
		maximumAge: 1000, //获取信息的周期时间
		frequency: 1000 //获取信息的周期时间 -未来会被删除并用maximumAge来替代该选项。
	},
	get: function (fn, arg) {
		arg = M.extend({}, this.defCfg, arg);
		navigator.geolocation.getCurrentPosition(fn, this._fail, arg);
	},
	watch: function (fn, arg) {
		arg = M.extend({}, this.defCfg, arg);
		this.watchId = navigator.geolocation.watchPosition(fn, this._fail, arg);
	},
	stopWatch: function (time, fn) {
		if (!time) {
			navigator.geolocation.clearWatch(this.watchID);
			this.watchID = null;
		} else {
			var that = this;
			setTimeout(function () {
				navigator.geolocation.clearWatch(that.watchID);
				that.watchID = null;
				if (fn) {
					fn();
				}
			}, time);
		}
	},
	getList: function (p) {
		var html = [
				'Latitude: ' + p.coords.latitude,
				'Longitude: ' + p.coords.longitude,
				'Altitude: ' + p.coords.altitude,
				'Accuracy: ' + p.coords.accuracy,
				'Altitude Accuracy: ' + p.coords.altitudeAccuracy,
				'Heading: ' + p.coords.heading,
				'Speed: ' + p.coords.speed
			];
		return html.join('<br />');
	}
};

/*
	@M.ntf.alert('score: 0', function () {}, 'game over', 'ok');//Windows Phone 7下，忽略所有的button名称，一直是'OK'。
	@M.ntf.confirm('score: 0', function (button) {alert('You selected button ' + button);}, 'game over', 'ok');
	@M.ntf.notification.open('title', {
		onclick: function () {},
		onshow: function () {},
		onclose: function () {},
		body: 'body',
		...
	});
	@M.ntf.notification.close();
	@M.ntf.beep(); //iPhone没有本地的蜂鸣API。PhoneGap通过多媒体API播放音频文件来实现蜂鸣。用户必须提供一个包含所需的蜂鸣声的文件。此文件播放时长必须短于30秒，位于www/root，并且必须命名为beep.wav。
	@M.ntf.shock(1000);//iphone忽略时间参数，震动时长为预先设定值。
*/
M.ntf = {//Notification
	alert: function (msg, callback, title, btnText) {
		navigator.notification.alert(
			msg, // 显示信息
			callback, // 警告被忽视的回调函数
			title, // 标题
			btnText // 按钮名称
		);
	},
	confirm: function (msg, callback, title, btnText) {
		navigator.notification.confirm(
			msg, // 显示信息
			callback, // 按下按钮后触发的回调函数，返回按下按钮的索引
			title, // 标题
			btnText // 按钮标签，逗号分隔多个
		);
	},
	notification: {
		open: function (title, args) {
			if (window.Notification) {
				var title = title || '棒老师';
				window.Notification(title, args);
			}
		},
		close: function () {
			if (window.Notification) {
				window.Notification.prototype.close();
			}
		}
	},
	beep: function (times) {//iphone 忽略该参数 默认1次
		times = times || 1;
		navigator.notification.beep(times);
	},
	shock: function (time) {
		time = time || 1000;
		navigator.notification.vibrate(time);
	}
};

/*
	@M.file.getRoot(function (fs) {}); //获取一个本地应用程序的FileSystem对象
	@M.file.getDirectory(fs, path, callback);//获取FileSystem对象中的指定目录，callback中返回DirectoryEntry对象（未找到则创建）
	@M.file.getFile(de, name, callback); //获取DirectoryEntry对象中的指定文件，callback中返回FileEntry对象（未找到则创建）
	@M.file.dir(M.rootPath + 'ewewew', function (de) {alert(de.fullPath)}); //查找指定目录，callback中返回DirectoryEntry对象（未找到则创建）
	@M.file.move({
		uri: M.rootPath + 'aaaeee',//源目标
		path: M.rootPath + 'DCIM',//移动地点，未填写该参数则根据有无type值确定是图片地址或音频地址
		newName: 'abcde',//移动后新名
		success: function () {//移动成功后的回调函数，callback中返回DirectoryEntry对象或FileEntry对象
			alert('ok');
		},
		type: 'video'
	});
	@M.file.copy(arg); //参数内容和M.file.move方法一致
	@M.file.upload({
		url: 'http://some.server.com/upload.php', //上传地址
		fullpath: uri,	//上传内容URI
		success: function (r) {
			console.log("Code = " + r.responseCode);
			console.log("Response = " + r.response);
			console.log("Sent = " + r.bytesSent);
		},
		error: function (r) {
			console.log(r.code);
		},
		fileKey: 'file', //可选
		mimeType: 'image/jpeg', //可选
		params: {time: 12934432432} //可选
	});
	@M.file.abort(function () {});
*/
M.file = {
	_imgPath: M.camera._imgPath,
	_mediaPath: M.media._mediaPath,
	_fail: function (error) {
		//console.log(error.code);
	},
	_success: function () {
	
	},
	_split: function (uri) {
		var name = uri.slice(uri.lastIndexOf('/') + 1),
			path = uri.slice(0, uri.lastIndexOf('/'));
		return {
			name: name,
			path: path
		};
	},
	getRoot: function (callback) {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, callback, this._fail);
	},
	getDirectory: function (fs, path, callback) {
		fs.root.getDirectory(path, {create: true, exclusive: false}, callback, this._fail);       
	},
	getFile: function (de, name, callback) {
		de.getFile(name, {create: true, exclusive: false}, callback || this._success, this._fail);
	},
	dir: function (uri, callback) {//if exist will not create
		var that = this,
			o = this._split(uri),
			path = o.path,
			dname = o.name;
		window.resolveLocalFileSystemURI(path, function (de) {
			de.getDirectory(dname, {create: true, exclusive: false}, callback || this._success, that._fail);
		}, null);
	},
	move: function (arg) {
		var u = arg.uri,//file
			p = arg.path || (arg.type !== 'video' ? this._imgPath : this._mediaPath),
			n = arg.newName,
			s = arg.success,
			that = this;
		this.dir(p);
		window.resolveLocalFileSystemURI(u, function (target) {
			//alert("got image file entry: " + target.name);     
			//now lets resolve the location of the destination folder
			window.resolveLocalFileSystemURI(p, function (destination) {
				// move the file 
				target.moveTo(destination, n || target.name, s, function () {console.log('error: 2')}); 
			}, function () {console.log('error: 1')});
		}, function () {console.log('error: 0')});
	},
	moveTemp: function (arg) {
		var u = M.cachePath,//directory
			p = arg.path || (arg.type !== 'video' ? this._imgPath : this._mediaPath),
			n = arg.newName,
			s = arg.success,
			that = this;
		this.dir(p);
		window.resolveLocalFileSystemURI(u, function (dirEntry) {
			//alert("got image file entry: " + target.name);     
			//now lets resolve the location of the destination folder
			var directoryReader = dirEntry.createReader();
			directoryReader.readEntries(function (target) {
				var l = target.length,
					i = 0;
				for (i; i < l; i++) {
					window.resolveLocalFileSystemURI(p, function (destination) {
						target[i].moveTo(destination, n || target.name, s, function () {console.log('error: 3')}); 
					}, function () {console.log('error: 2')});
				}
			}, function () {console.log('error: 1')});
		}, function () {console.log('error: 0')});
	},
	copy: function (arg) {
		var u = arg.uri,
			p = arg.path || (arg.type !== 'video' ? this._imgPath : this._mediaPath),
			n = arg.newName,
			s = arg.success,
			that = this;
		this.dir(p);
		window.resolveLocalFileSystemURI(u, function (target) {
			window.resolveLocalFileSystemURI(p, function (destination) {
				target.copyTo(destination, n || target.name, s, function () {console.log('error: 2')}); 
			}, function () {console.log('error: 1')});
		}, function () {console.log('error: 0')});
	},
	getSize: function (uri, callback) {
		var n = uri.slice(uri.lastIndexOf('/') + 1),
			u = uri.slice(0, uri.lastIndexOf('/')),
			result = 0,
			that = this;
		window.resolveLocalFileSystemURI(u, function (target) {
			target.getFile(n, {create: false, exclusive: true}, function (file) {
				file.file(function (file) {
					if (callback) {
						callback(file.size);
					}
				}, function () {
					console.log('error: 2');
				});
			}, function () {
				console.log('error: 1');
			});
		}, function () {console.log('error: 0')});
	},
	upload: function (arg) {
		/*
			*fullpath: 'localhost',//fe.fullpath
			*url: 'server',
			*success: function (FileUploadResult) {}
		*/
		var options = new FileUploadOptions(),
			ft = new FileTransfer();
		this.ft = ft;
		options.chunkedMode = false;
		options.fileKey = arg.fileKey || 'file';
		options.fileName = this._split(arg.fullpath).name;
		options.mimeType = arg.mimeType || 'image/jpeg';
		options.headers = '';
		options.params = arg.params || {};
		options.params.onProcess = arg.processing || null;
		ft.upload(arg.fullpath, arg.url, arg.success, arg.error || this._fail, options);
	},
	abort: function (callback) {//cancel upload
		this.ft.abort(callback || function () {}, this._fail);
	}
}






















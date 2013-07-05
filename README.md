TUAN - an example with D1ma.js
==============================

javascript, mobile, MVC framework
---------------------------------

###Route

you can use route to define which page to load with a special hash;

>D1ma.route.add('#hash', 'hash', function () {console.log('this will show before page append to html body');});

Also, you can use D1ma.route.del(hash) to delete one route rule.

###Template

After create your static html file, you can use template to replace some place where you will fill in your data.

> <a href="<%=obj.href%>" class="<%=obj.klass%>"><img src="<%=obj.src%>" /></a>

Template support logic like for、 if else.

###Hash

if you want to link to some page, change hash.

> <a href="#ppp"></a>

You can alse use javascript to jump.

> location.hash = '#ppp'; 

or

> D1ma.load('#ppp');

###model

you should define model for your every page. 

> D1ma.model[hash] = {...}

> D1ma.model[hash].data = ...

Your data should defined in model's data. And it will be used when template need.

> D1ma.model[hash].load = function () {...}

Every time your page be loaded, load function will be run to initialize page. Like set button click event and so on.

###Effect

D1ma support some effect of page transitions.

> D1ma.currentEffect = 'normal';

####effect list

1.normal

2.slide

3.fade

4.pop

5.slidefade

6.slidedown

These effect are defined in animate.css copy from jQuery Mobile.


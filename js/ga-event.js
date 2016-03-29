jQuery(function($){
	$('body').on('click', 'h1.logo', function(e){
		ga('yueyuebookstore.send', 'event', 'logo', 'click', 'logo');
	}).on('click', '#back-top a', function(e){
		ga('yueyuebookstore.send', 'event', 'page-down', 'click', 'page-down');
	}).on('click', '.nav a', function(e){
		var val = $(this).attr('href').replace("#","");
		if (typeof($(this).parent().attr('class')) === "undefined") {
			ga('yueyuebookstore.send', 'event', 'menu', 'click', val);
		}
	}).on('click', '.mobile-menu a', function(e){
		var val = $(this).attr('href').replace("#","");
        ga('yueyuebookstore.send', 'event', 'menu', 'click', val);
	}).on('click', '.share-nav li', function(e){
		ga('yueyuebookstore.send', 'event', 'share', 'click', $(this).attr('class'));
	}).on('click', '.mobile-share-nav li', function(e){
		ga('yueyuebookstore.send', 'event', 'share', 'click', $(this).attr('class'));
	}).on('click','#history .post-tab li', function(e){
		ga('yueyuebookstore.send', 'event', 'history', 'click', $(this).text());
	}).on('click','#post-list .post-tab li', function(e){
		ga('yueyuebookstore.send', 'event', 'post-list', 'click', $(this).text());
	});
});
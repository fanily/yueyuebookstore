var document = window.document;
var $ = window.jQuery;
var MustacheTemplate = (function(){
    return function (id, data, partial) {
        var static_template = $(id).html();
        if(typeof(data) === "undefined"){
            return window.Mustache.render(static_template);
        }else{
            if(typeof(partial) === "undefined"){
                return window.Mustache.render(static_template, data);
            }else{
                return window.Mustache.render(static_template, data, partial);
            }
        }
    };
})();

$.getJSON("config.json?t=1464764398", function(config) {
	var get_fanily_post = function(keyword, body, callback) {
		$.ajax({
			url : config.api+"search/lists/"+keyword,
			type : "get",
			dataType : "text",
			beforeSend : function() {
	            body.append('<div class="loading"></div>');
	            body.find('.loading').css('display','block');
	        }
		}).done(function(data){
			 callback(data);
		});
	};

	//append topic
	var tabData = [];
	$.each(config.salon, function(k,v){
		tabData.push({
			name : v.name,
			current : v.current,
		});
	});
	var topictab = MustacheTemplate('#template-tab', {tab: tabData});
	$('#topic .topic-tab').append(topictab);

	//append topic
	var topicLayout = MustacheTemplate('#template-topic-content', {topics: tabData});
	$('#topic .topic-container').append(topicLayout);

	$.each(config.salon, function(k, v){
		if(window.devicePixelRatio > 1) {
			v.curator.avatars += '@2x';
		}
		if (v.curator.info.length > 90) {
			var info = v.curator.info.substring(0, 90);
			var index = info.lastIndexOf('，');

			if (index !== -1) {
				info = info.substring(0, index);
			}
			v.curator.info = info+'⋯⋯';
		}
		v.curator.id = k;

		var curatorHtml = MustacheTemplate('#template-topic-curator', v.curator);
		$('#topic .topic-content:eq('+k+') .curator-inner').append(curatorHtml);

		v.topic.id = k;
		var mobiletopicHtml = MustacheTemplate('#template-mobile-topic-info', v.topic);
		$('#topic .topic-content:eq('+k+') .mobile-topic .info').append(mobiletopicHtml);

		var topicHtml = MustacheTemplate('#template-topic-info', v.topic);
		$('#topic .topic-content:eq('+k+') .top-topic .info').append(topicHtml);


		if (v.books.length === 0) {
			$('#topic .topic-content:eq('+k+') .info-topic .books').hide();
		} else {
			var row = 4;
			if (window.matchMedia("screen and (max-width: 667px)").matches) {
				row = 2;
			}
			var i = v.books.length % row;
			while (i !== 0) {
				v.books.push({
					"name" : "",
					"author" : "",
					"img" : "",
					"url" : ""
				});
				i--;
			}
			$.each(v.books, function(k, v){
				if(window.devicePixelRatio > 1 && v.img !== "") {
					v.img += '@2x';
				}
			});
			var booksHtml = MustacheTemplate('#template-topic-books', {
				books: v.books
			});
			$('#topic .topic-content:eq('+k+') .booklist').append(booksHtml);

			var w = v.books.length / row;
			if (w >= 2) {
				var c = 1;
				var controlHtml = '<ul class="control"><li class="prev"></li>';

				while (c <= w) {
					if (c === 1) {
						controlHtml += '<li class="dot current"></li>';
					} else{
						controlHtml += '<li class="dot"></li>';
					}

					c++;
				}
				controlHtml += '<li class="next"></li></ul>';

				$('#topic .topic-content:eq('+k+') .books').append(controlHtml);
			}
		}

		if (v.next_topic.date === "") {
			$('#topic .topic-content:eq('+k+') .info-topic .next-topic').hide();
		} else {
			var nextHtml = MustacheTemplate('#template-topic-next', v.next_topic);
			$('#topic .topic-content:eq('+k+') .next-topic .content').append(nextHtml);
		}
	});

	//append post
	$.each(config.keywords, function(id, data){
		var tabHtml = MustacheTemplate('#template-post-tab', {tab: data});
		var $postSection = $('#'+id);
		$postSection.find('.post-tab').append(tabHtml);

		$.each(data, function(k, v){
			var layoutHtml = MustacheTemplate('#template-post-layout', {current: v.current});
			$postSection.find('.post-container').append(layoutHtml);

			get_fanily_post(v.keyword, $postSection.find('.post-content:eq('+k+')'), function(data){
				$postSection.find('.post-content:eq('+k+') .loading').remove();

				temp = JSON.parse(data);
				 if (temp.length === 0) {
				 	var messageHtml = MustacheTemplate('#template-no-post');
				 	$postSection.find('.post-content:eq('+k+')').append(messageHtml);
				 } else {
					var n = 0;
					var postData = [];
					for( $this in temp ){
						if (n >= 8) {
							break;
						}

						var data = temp[$this];
						if (data.post_image == '/img/logo.png') {
							data.post_image = 'img/logo.png';
						}
						postData.push({
							title: data.post_title,
							id: data.id,
							img: data.post_image,
						});

						n++;
					}

					var postHtml = MustacheTemplate('#template-post-list', {
						post : postData,
						more : temp.length > 8,
						keyword : v.keyword
					});
					$postSection.find('.post-content:eq('+k+')').append(postHtml);
				}
				if (v.current) {
					setInterval(function(){
						$postSection.find('.current .grid').masonry({
							"itemSelector": '.grid-item'
						});
					}, 3000);
				};
			});
		});
	});

	//append video
	$.each(config.video,function(key,v){
		if (key < 6) {
			v.isShow = true;
		} else {
			v.isShow = false;
		}
		if (v.url === "") {
			v.url = 'https://www.youtube.com/watch?v='+v.vid;
		}
	});

	var videoHtml = MustacheTemplate('#template-video-layout', {video:config.video});
	$('#video-list .video-list').append(videoHtml);
	if (config.video.length > 6) {
		$('#video-list .more').addClass('show');
	}

	$('body').on('click', '.lightbox-btn', function(e){
		var type = $(this).attr('data-type');
		if (type !== "about") {
			var id = $(this).attr('data-id');
			if (type === "topic") {
				var lightboxHtml = MustacheTemplate('#template-lightbox-topic', config.salon[id].topic);
			}
			if (type === "curator") {
				var lightboxHtml = MustacheTemplate('#template-lightbox-curator', {
					id: id,
					name: config.salon[id].name,
					info: config.salon[id].info,
					curator_name: config.salon[id].curator.name,
					curator_info: config.salon[id].curator.info
				});
			}

			$('.lightbox .lightbox-content[data-type='+type+']').find('.info').empty();
			$('.lightbox .lightbox-content[data-type='+type+']').find('.info').append(lightboxHtml);
		}

		$('.lightbox .lightbox-content[data-type='+type+']').addClass('show');
		$('.lightbox').addClass('show');
		$('body').css({'overflow':'hidden'});
	}).on('click', '#video-list .more', function(e){
		$('#video-list .video:not(.show):lt(6)').addClass('show');
		var n = $('#video-list .video:not(.show)').length;
		if (n === 0) {
			$('#video-list .more').removeClass('show');
		}
	});

	if (window.location.hash !== "") {
		var hash_array = window.location.hash.slice(1).split('-');
		if (hash_array[0] === "topic" && typeof(hash_array[1]) !== "undefined") {
			$('.topic-tab li').eq(hash_array[1]).click();
		} else {
			var target = $(window.location.hash);
			target = target.length ? target : $('[name=' + window.location.hash.slice(1) +']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top - $('.toolbar').height()
				}, 1000);
			}
		}
	}
});

$(window).scroll(function () {
if ($(this).scrollTop() > 100) {
		$('#back-top').fadeIn();
	} else {
		$('#back-top').fadeOut();
	}
});

$('body').on('click', '#back-top a', function(e){
	e.preventDefault();
	$('body,html').animate({
		scrollTop: 0
	}, 800);

	return false;
}).on('click', '.nav .go', function(e){
	var target = $(this.hash);
	target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

	if (target.length) {
		window.location.hash = this.hash;
		$('html,body').animate({
			scrollTop: target.offset().top - $('.toolbar').height()
		}, 1000);
	}

}).on('click', '.nav .share', function(e){
	var toggled = $(this).data('toggled');
	$(this).data('toggled', !toggled);

	if (!toggled) {
		$('.share-nav').slideDown('normal');
	} else {
		$('.share-nav').slideUp('fast');
	}
}).on('click', '.mobile-nav .share', function(e){
	if ($('.mobile-menu').is(':visible')) {
		$('.mobile-nav .menu').click();
	}

	var toggled = $(this).data('toggled');
	$(this).data('toggled', !toggled);

	if (!toggled) {
		$('.mobile-share-nav').slideDown('normal');
	} else {
		$('.mobile-share-nav').slideUp('fast');
	}
}).on('click', '.share-nav li', function(e){
	var $self = $(this);
	var title = $('title').text();
	var url = window.location.origin+window.location.pathname;

	if ($self.hasClass("fb")) {
		window.open('https://www.facebook.com/share.php?u='+encodeURI(url), '_blank');
	}
	if ($self.hasClass("plus")) {
		window.open('https://plus.google.com/share?url=' + encodeURI(url), '_blank');
	}
	if ($self.hasClass("weibo")) {
		window.open('http://v.t.sina.com.cn/share/share.php?title='+title+'&url='+url, '_blank');
	}

	$('.nav .share').click();

}).on('click', '.mobile-share-nav li', function(e){
	var $self = $(this);
	var title = $('title').text();
	var url = window.location.origin+window.location.pathname;

	if ($self.hasClass("fb")) {
		window.open('https://www.facebook.com/share.php?u='+encodeURI(url), '_blank');
	}
	if ($self.hasClass("plus")) {
		window.open('https://plus.google.com/share?url=' + encodeURI(url), '_blank');
	}
	if ($self.hasClass("weibo")) {
		window.open('http://v.t.sina.com.cn/share/share.php?title='+title+'&url='+url, '_blank');
	}

	$('.mobile-nav .share').click();
}).on('click', '.mobile-nav .menu', function(e){
	if ($('.mobile-share-nav').is(':visible')) {
		$('.mobile-nav .share').click();
	}

	var toggled = $(this).data('toggled');
	$(this).data('toggled', !toggled);

	if (!toggled) {
		$('.mobile-menu').slideDown('normal');
	} else {
		$('.mobile-menu').slideUp('fast');
	}

}).on('click', '.mobile-menu .go', function(e){
	$('.mobile-nav .menu').click();

	var target = $(this.hash);
	target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

	if (target.length) {
		window.location.hash = this.hash;
		$('html,body').animate({
			scrollTop: target.offset().top - $('.toolbar').height()
		}, 1000);
	}

}).on('click', '#topic .topic-tab li', function(e){
	var $topic_div = $('#topic .topic-container');
	var index = $('#topic .topic-tab li').index(this);

	window.location.hash = "#topic-"+index;

	$(this).siblings().removeClass('current');
	$(this).addClass('current');
	$topic_div.find('.topic-content').not(index).removeClass('current');
	$topic_div.find('.topic-content').eq(index).addClass('current');
}).on('click', '.post-section .tab li', function(e){
	var $post_div = $(this).parents('.post-list');
	var index = $post_div.find('.tab li').index(this);

	$(this).siblings().removeClass('current');
	$(this).addClass('current');

	$post_div.find('.post-content').not(index).removeClass('current');
	$post_div.find('.post-content').eq(index).addClass('current').find('.grid').masonry({
		"itemSelector": '.grid-item'
	});

}).on('click', '.lightbox .close', function(e){
	$('.lightbox .lightbox-content').removeClass('show');
	$('.lightbox').removeClass('show');

	$('body').css({'overflow':'auto'});

}).on('click', '#topic .control .prev', function(e){
	var $booklist = $('.topic-container .current .booklist');
	var $control = $('.topic-container .current .control');

	var n = $control.find('.dot').index($control.find('.current')) - 1;
	if (n >= 0) {
		$booklist.animate({
			scrollLeft: $booklist.scrollLeft() - $booklist.width()
		}, 500);
		$control.find('.dot').removeClass('current');
		$control.find('.dot:eq('+n+')').addClass('current');
	}

}).on('click', '#topic .control .next', function(e){
	var $booklist = $('.topic-container .current .booklist');
	var $control = $('.topic-container .current .control');

	var max = $control.find('.dot').length - 1;
	var n = $control.find('.dot').index($control.find('.current')) + 1;
	if (max >= n) {
		$booklist.animate({
			scrollLeft: $booklist.scrollLeft() + $booklist.width()
		}, 500);
		$control.find('.dot').removeClass('current');
		$control.find('.dot:eq('+n+')').addClass('current');
	}

}).on('click', '#topic .control .dot', function(e){
	var $topic = $('.topic-container .current');
	var x = $topic.find('.booklist').width();
	var index = $topic.find('.control .dot').index(this);

	$topic.find('.booklist').animate({
		scrollLeft: index*x
	}, 500);

	$(this).siblings().removeClass('current');
	$(this).addClass('current');
});

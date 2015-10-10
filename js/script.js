jQuery(document).ready(function($){
  	$(window).scroll(function() {
		if ($(window).scrollTop() > 100 ){
 			$('.top-header').addClass('shows');
  		} else {
   	 		$('.top-header').removeClass('shows');
 		};   	
	});

	$('a[href="stats"]').click(function() {
		document.location = '/stats';
	})
});

jQuery('.scroll').on('click', function(e){		
		e.preventDefault()
    
  jQuery('html, body').animate({
      scrollTop : jQuery(this.hash).offset().top
    }, 1500);
});

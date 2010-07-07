/*
* imageHighlighterEditor
*
* imageHighlighter & imageHighLighterEditor are currently available for use in all personal or commercial 
* projects under both MIT and GPL licenses.
*
* <http://wowmotty.blogspot.com/2010/06/imagehighlighter-v10.html>
*
* imageHighlighterEditor
* @v1.01    - 07-06-2010 split out the editor from the main plugin & added functionality with jCrop plugin
* @v1.0     - 06-30-2010 major overhaul of code & renaming of plugin)
* @v.91beta - 09-29-2009 fixed a few bugs with edit mode)
* @v.90beta - 09-26-2009
* @author     Rob G <wowmotty@gmail.com>
*/
(function($){
 $.imageHighlighterEditor = function(el, options){
  var base = this;
  base.$el = $(el);
  base.el = el; 

  // No edit mode if imageHighlighter isn't attached!
  if (!base.$el.data("imageHighlighter")){ return; }

  // disable selecting image (happens when you double click)
  base.$el
   .attr('unselectable', 'on')
   .css('-moz-user-select', 'none');
  base.el.onselectstart = function() { return false; }; // IE

  var imgHL = base.$el.data("imageHighlighter"),
      imgWrap = base.$el.parent(),
      t; // temp variable
  
  base.$el.data("imageHighlighterEditor", base);

  base.init = function(){
   base.options = $.extend({},$.imageHighlighterEditor.defaultOptions, options);
   base.options.lockMode = false; // lockMode flag for internal use only

   // Add info divs
   base.$el.after('<div class="imgHLInfo"></div><div class="imgHLCoords"></div>');
   
   // initialize jcrop plugin unless option set
   base.options.jcrop = ($.Jcrop && base.options.useJcrop) ? true : false;
   // initialize jCrop then hide it
   if (base.options.jcrop){
    base.$el.Jcrop({
     onChange: base.move,
     onSelect: base.move,
     keySupport: false
    });
    // hide jcrop by holders, delay needed to set up elements
    setTimeout(function(){
     $('.jcrop-holder').hide();
     base.$el.show();
    },100);
   }

   if (!base.options.jcrop){
    // click on image to lock & mousemove to get coordinates
    base.$el
     .mousemove(function(e){ if (imgHL.options.editMode){ base.move(e); } })
     .click(function(){ base.imgHLLock(); });
   }

   // double click on image (or jcrop wrapper) to toggle edit mode
   imgWrap.dblclick(function(){
    base.edit();
    return false;
   });
   
   // wait for highlightActive event to show box data
   base.$el.bind('highlightActive', function(e,data){
    if (imgHL.options.editMode){
     imgWrap.find('.imgHLInfo').html('Highlight coordinates for ' + data.object.html() + ': ' + data.object.attr('rel'));
    } 
   });
  };

  base.edit = function(){
   imgHL.options.editMode = !imgHL.options.editMode;

   imgWrap.find('.imgHLCoords, .imgHLInfo').empty();
   if (imgHL.options.editMode){
    // enable edit mode
    imgWrap
     .addClass('imgHLEdited')
     .find('.imgHLDark,.imgHLLight').removeClass('imgHLOverlay').hide();
    if (base.options.jcrop){
     t = 'Current box coordinates : <input class="wideCoords" type="text" value="" />';
     imgWrap.find('.jcrop-holder').show(); // jcrop wrapper
     base.$el.hide();
    } else {
     t = 'Mouse x,y coordinates (click to lock/unlock) : <input class="regCoords" type="text" value="" />';
     base.$el.css('cursor','crosshair');
    }
    imgWrap
     .find('.imgHLCoords').html(t)
     .find('input')
      .focus(function(){ this.select(); })   // select text in input box on focus
      .mouseup(function(){ return false; }); // prevent Safari & Chrome from unselecting
   } else {
    // disable edit mode
    imgWrap
     .removeClass('imgHLEdited imgHLLocked')
     .find('.imgHLDark').show();
    if (base.options.jcrop) {
     imgWrap.find('.jcrop-holder').hide();
     base.$el.show();
    }
    base.$el.css('cursor','default');
    base.options.lockMode = false;
   }
   return false;
  };

  /* Edit Mode - get coordinates */
  base.move = function(e){
   // e = event, but has coordinates from jcrop when it is active
   if (base.options.lockMode) { return; }
   if (base.options.jcrop) {
    t = e.x + ','+ e.y + ',' + e.x2 + ',' + e.y2;
   } else {
    t = base.$el.position();
    var tleft = parseInt(e.pageX - t.left, 10),
        ttop = parseInt(e.pageY - t.top, 10);
    t = Math.max(0,tleft) + ',' + Math.max(0,ttop); // don't show values < 0
   }
   imgWrap.find('.imgHLCoords input').val(t);
   return false;
  };

  /* Lock Coordinates */
  base.imgHLLock = function(){
   if (imgHL.options.editMode){
    base.options.lockMode = !base.options.lockMode;
    if (base.options.lockMode){
     imgWrap.addClass('imgHLLocked');
    } else {
     imgWrap.removeClass('imgHLLocked');
    }
   }
  };

  base.init();
 };

 $.imageHighlighterEditor.defaultOptions = {
  useJcrop : true
 };

 $.fn.imageHighlighterEditor = function(options){
  return this.each(function(){
   (new $.imageHighlighterEditor(this, options));
  });
 };

 $.fn.getimageHighlighterEditor = function(){
  return this.data("imageHighlighterEditor");
 };

})(jQuery);
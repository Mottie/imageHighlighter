/*
* imageHighlighter allows you to highlight certain areas of an image and display
* a description from just hovering over a link. 
*
* This plugin does not use imagemaps, nor will it highlight anything other than a rectangle. If you need these
* capabilities, check out these other plugins:
*  David Lynch's jQuery plugin: http://davidlynch.org/blog/2008/03/maphilight-image-map-mouseover-highlighting/
* or
*  mapper.js (javascript): http://www.netzgesta.de/mapper/
*
* imgHighLight is currently available for use in all personal or commercial 
* projects under both MIT and GPL licenses.
*
* <http://wowmotty.blogspot.com/2010/06/imagehighlighter-v10.html>
*
* imageHighlighter
* @v1.0     - 06-30-2010 (major overhaul of code & renaming of plugin)
* @v.91beta - 09-29-2009 (fixed a few bugs with edit mode)
* @v.90beta - 09-26-2009
* @author     Rob G <wowmotty@gmail.com>
*/
(function(){
 $.imageHighlighter = function(el, options){
  // To avoid scope issues, use 'base' instead of 'this'
  // to reference this class from internal events and functions.
  var base = this;

  // Access to jQuery and DOM versions of element
  base.$el = $(el);
  base.el = el;

  // Add a reverse reference to the DOM object (image)
  base.$el.data("imageHighlighter", base);

  /* Initialize */
  base.init = function(){
   base.options = $.extend({},$.imageHighlighter.defaultOptions, options);

   /* Initialize script */
   // Target image tag
   if (base.$el[0].tagName != 'IMG') { return false; }
   // wrap, then add overlay and highlight divs
   base.$el
    .wrap('<div/>') // add wrap to contain highlight, overlay and edit mode divs
    .before('<div class="imgHLDark"></div><div class="imgHLLight"></div>');

   /* check for edit mode & setup */
   if ($(base.options.list).filter('.imgHLEdit').length) {
    base.setupEdit();
   } else {
    base.options.editMode = false; // disable edit mode
   }

   /* Add ImgHighlight to links & use hoverIntent if it is loaded */
   var links = $(base.options.list).click(function(){
    return false;
   });
   if (jQuery().hoverIntent){
    // hoverIntent setup with timeout
    links.hoverIntent({
     over: function(){ base.imgHLHover($(this)); },
     timeout: base.options.hoverTimeout,
     out: function(){ base.imgHLUnhover(); }
    });
   } else {
    // hover without hoverIntent
    links.hover(function(){
     base.imgHLHover($(this));
    },function(){
     base.imgHLUnhover();
    });
   }
  };

  /* Calculate & position the overlay and image snippet */
  base.imgHLHover = function(el){
   // no coords seen, return
   if (el.attr('rel')=='') { return; }
   // add Currently displayed class to link
   el.addClass(base.options.current);
   var c = el.attr('rel').split(','), // get coordinates of highlight
       brdr = parseInt(base.options.borderSize,10); // parse, just in case
   var imgWrap = base.$el.parent(),
       imgX = base.$el.position().left,
       imgY = base.$el.position().top,
       xOffset = parseInt(c[0],10) || 0, // set to zero if coordinate missing
       yOffset = parseInt(c[1],10) || 0,
       xRight = parseInt(c[2],10) || 0,
       yBottom = parseInt(c[3],10) || 0;
   // Position overlay
   imgWrap.find('.imgHLDark').css({
    // add one to width and height to make it easier to get the cursor to the bottom right corner
    height   : base.$el.outerHeight() + 1,
    width    : base.$el.outerWidth() + 1,
    position : 'absolute',
    top      : imgY,
    left     : imgX
   });
   // save current element (for get function)
   base.$el.data('currentHighlight', el);
   // Display highlight using overlay of cropped background image
   imgWrap.find('.imgHLLight')
    .css({
     'background' : 'url(' + base.$el.attr('src') + ') -' + xOffset + 'px -' + yOffset + 'px ' + 'no-repeat',
     'position'   : 'absolute',
     'left'       : xOffset + imgX - brdr,
     'top'        : yOffset + imgY - brdr,
     // if IE, double the border width
     'width'      : ($.browser.msie) ? xRight + (brdr*2) - xOffset : xRight - xOffset,
     'height'     : ($.browser.msie) ? yBottom + (brdr*2) - yOffset : yBottom - yOffset,
     'border'     : base.options.borderColor + ' ' + brdr + 'px ' + base.options.borderType,
     'z-index'    : base.options.zindex
    })
    .show();
   // Show overlay after the highlight is shown, make sure it is below (zindex)
   if (!base.options.editMode && !base.options.lockMode && base.options.overlay){
    imgWrap.find('.imgHLDark').addClass('imgHLOverlay').css('z-index', parseInt(base.options.zindex,10) - 1 ).show();
   }

   // Show Description
   $(base.options.descripClass).html(el.parent().find(base.options.descrip).html());
   // Edit mode coordinates display
   if (base.options.editMode) {
    imgWrap.find('.imgHLInfo').html('Highlight coordinates for ' + el.html() + ': ' + c.join(', '));
   }
  };

  base.imgHLUnhover = function(){
   $(base.options.list).filter('.' + base.options.current).removeClass(base.options.current);
   $(base.options.descripClass).empty();
   if (base.options.editMode) { return; }
   var imgWrap = base.$el.parent();
   imgWrap.find('.imgHLDark').removeClass('imgHLOverlay');
   imgWrap.find('.imgHLLight').hide();
   base.$el.data('currentHighlight', null); // clear current highlighted object
  };

  /* Edit Mode - Setup */
  base.setupEdit = function(){
   base.$el.after('<div class="imgHLInfo"></div><div class="imgHLCoords"></div>');
   var imgWrap = base.$el.parent();
   var imgGroup = imgWrap.find('.imgHLDark, .imgHLLight').add(base.$el);
   $(base.options.list).filter('.imgHLEdit')
    .wrap('<span/>')
    .after('<span class="imgHLStatus"></span>')
    .click(function(){
     base.options.editMode = !base.options.editMode;
     var stat = $(base.options.list).filter('.imgHLEdit').parent().find('.imgHLStatus');
     stat.text( (base.options.editMode) ? ' (enabled)' : '');
     imgWrap.find('.imgHLDark').removeClass('imgHLOverlay');
     imgWrap.find('.imgHLLight').hide();
     imgWrap.find('.imgHLCoords, .imgHLInfo').empty();

     if (base.options.editMode) {
      imgGroup.css('cursor','crosshair');
     } else {
      imgGroup.css('cursor','default');
      base.options.lockMode = false;
      stat.removeClass('imgHLLocked');
     }
     return false;
    });
    // Had to include hovering over the image for IE
    imgGroup
     .mousemove(function(e){ if (base.options.editMode){ base.imgHLEditMove(e,this); } })
     .click(function(){ base.imgHLEditClick(); });
  };

  /* Edit Mode - get coordinates */
  base.imgHLEditMove = function(e,el){
   if (base.options.lockMode) { return; }
   var curX = (document.all) ? event.clientX + $(window).scrollLeft() : e.pageX;
   var curY = (document.all) ? event.clientY + $(window).scrollTop() : e.pageY;
   var tleft = parseInt(curX - base.$el.position().left, 10);
   var ttop = parseInt(curY - base.$el.position().top, 10);
   base.$el.parent().find('.imgHLCoords').html('<span>X = ' + tleft + 'px, ' + 'Y = ' + ttop + 'px</span> - Click to lock/unlock coordinates');
  };

  /* Lock Coordinates */
  base.imgHLEditClick = function(){
   if (base.options.editMode) {
    base.options.lockMode = !base.options.lockMode;
    base.$el.parent().find('.imgHLCoords span')
     .add($(base.options.list).filter('.imgHLEdit').parent().find('.imgHLStatus'))
     .toggleClass('imgHLLocked', base.options.lockMode);
   }
  };

  /* get: var currentHighlight = $('#imgHL').data('imageHighlighter').highlight();       // returns link object of current highlight
     set: var currentHighlight = $('#imgHL').data('imageHighlighter').highlight(1);      // find 1st link and highlight image
          var currentHighlight = $('#imgHL').data('imageHighlighter').highlight('box');  // finds link that contains "box" in its text (case sensitive)
          var currentHighlight = $('#imgHL').data('imageHighlighter').highlight('.box'); // finds link with "box" class
  */
  base.highlight = function(val){
   if (typeof(val) !== 'undefined') {
    base.imgHLUnhover();
    var el = $(base.options.list);
    if (isNaN(val)){
     // find link using selector or text inside the link
     val = (val.charAt(0).match(/\.|#/)) ? val : ':contains(' + val + ')';
     el = el.filter(val + ':first'); // pick first link if multiple found
    } else {
     // find nth link (indexed from one)
     var n = parseInt(val,10);
     n =  (n < $(base.options.list).length) ? n : 0; // if # too big, pick 0 then null will be returned.
     el = el.eq( n - 1 );
    }
    if (el.length) { base.imgHLHover(el); }
   }
   return base.$el.data('currentHighlight') || null; // return current highlight object, null if nothing currently selected
  };

  // Run initializer
  base.init();
 };

 $.imageHighlighter.defaultOptions = {
  borderColor : "#fff",         // highlight border color
  borderSize  : 4,              // highlight border thickness
  borderType  : "solid",        // highlight border type
  list        : "a",            // links that contain the highlight coordinates
  descrip     : "p",            // HTML tag sibling of the link, that contains the description text (hidden)
  descripClass: ".description", // HTML tag where description text is shown (placeholder)
  overlay     : true,           // display an overlay to make the highlight stand out
  current     : "current",      // class applied to link currently used to highlight the image
  hoverTimeout: 100,            // hoverIntent timeout (only applied if hoverIntent plugin is loaded)
  zindex      : 10,             // z-index of highlight box, overlay is automatically made 1 less than this number
  editMode    : false,          // edit mode flag, when activated (via a link) cursor coordinates are displayed under the image
  lockMode    : false           // locks edit mode so the mouse positions can be more easily read
 };

 $.fn.imageHighlighter = function(options){
  return this.each(function(){
   (new $.imageHighlighter(this, options));
  });
 };

 // This function breaks the chain, but returns
 // the imageHighlighter if it has been attached to the object.
 $.fn.getimageHighlighter = function(){
  this.data("imageHighlighter");
 };

})(jQuery);

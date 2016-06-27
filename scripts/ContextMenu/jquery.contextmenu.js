/**
 * jQuery plugin for Pretty looking right click context menu.
 *
 * Requires popup.js and popup.css to be included in your page. And jQuery, obviously.
 *
 * Usage:
 *
 *   $('.something').contextPopup({
 *     title: 'Some title',
 *     items: [
 *       {label:'My Item', icon:'/some/icon1.png', action:function() { alert('hi'); }},
 *       {label:'Item #2', icon:'/some/icon2.png', action:function() { alert('yo'); }},
 *       null, // divider
 *       {label:'Blahhhh', icon:'/some/icon3.png', action:function() { alert('bye'); }, isEnabled: function() { return false; }},
 *     ]
 *   });
*
* Icon needs to be 16x16. I recommend the Fugue icon set from: http://p.yusukekamiyamane.com/ 
    *
    * - Joe Walnes, 2011 http://joewalnes.com/
    *   https://github.com/joewalnes/jquery-simple-context-menu
 *
 * MIT License: https://github.com/joewalnes/jquery-simple-context-menu/blob/master/LICENSE.txt
<<<<<<< HEAD
 */
jQuery.fn.contextPopup = function (menuData, EnvironmentId) {
    // Define default settings

=======
    */
jQuery.fn.contextPopup = function (menuData, EnvironmentId) {
    // Define default settings
    
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
    var settings = {
        contextMenuClass: 'contextMenuPlugin',
        linkClickerClass: 'contextMenuLink',
        gutterLineClass: 'gutterLine',
        headerClass: 'header',
        seperatorClass: 'divider',
        title: '',
        items: []
    };
<<<<<<< HEAD

=======
	
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
    // merge them
    $.extend(settings, menuData);

    // Build popup menu HTML
    function createMenu(e) {
        var menu = $('<ul class="' + settings.contextMenuClass + '"><div class="' + settings.gutterLineClass + '"></div></ul>')
          .appendTo(document.body);
        if (settings.title) {
            $('<li class="' + settings.headerClass + '"></li>').text(settings.title).appendTo(menu);
        }
<<<<<<< HEAD
        settings.items.forEach(function (item) {
            if (item) {
                var rowCode = '<li><a href="#" class="' + settings.linkClickerClass + '"><span class="itemTitle"></span></a></li>';
                //if(item.icon)
                 // rowCode += '<img>';
                // rowCode +=  '<span></span></a></li>';
                var row = $(rowCode).appendTo(menu);
               if (item.icon) {
=======
        settings.items.forEach(function(item) {
            if (item) {
                var rowCode = '<li><a href="#" class="'+settings.linkClickerClass+'"><span class="itemTitle"></span></a></li>';
                // if(item.icon)
                //   rowCode += '<img>';
                // rowCode +=  '<span></span></a></li>';
                var row = $(rowCode).appendTo(menu);
                if(item.icon){
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
                    var icon = $('<img>');
                    icon.attr('src', item.icon);
                    icon.insertBefore(row.find('.itemTitle'));
                }
                row.find('.itemTitle').text(item.label);

<<<<<<< HEAD
                switch (item.label) {
=======
                switch(item.label)
                {
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
                    case 'Deploy':
                        if (e.target.className.search('notStarted') >= 0)
                            item.isEnabled = true;
                        else
                            item.isEnabled = false;
                        break;
<<<<<<< HEAD

=======
            
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
                    case 'Cancel':
                        if (e.target.className.search('pending') >= 0 || (e.target.className.search('running') >= 0))
                            item.isEnabled = true;
                        else
                            item.isEnabled = false;
                        break;
                    case 'Re-Deploy':
                        if (e.target.className.search('failed') >= 0)
                            item.isEnabled = true;
                        else
                            item.isEnabled = false;
                        break;
                }
<<<<<<< HEAD

                if (item.isEnabled != undefined && item.isEnabled == false) {
                    row.addClass('disabled');
                } else if (item.action) {
                    row.find('.' + settings.linkClickerClass).click(function () { item.action(e); });
=======
      
                if (item.isEnabled != undefined && item.isEnabled == false) {
                    row.addClass('disabled');
                } else if (item.action) {
                    row.find('.'+settings.linkClickerClass).click(function () { item.action(e); });
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
                }

            } else {
                $('<li class="' + settings.seperatorClass + '"></li>').appendTo(menu);
            }
        });
<<<<<<< HEAD
        menu.find('.' + settings.headerClass).text(settings.title);
=======
        menu.find('.' + settings.headerClass ).text(settings.title);
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
        return menu;
    }

    // On contextmenu event (right click)
    this.on('contextmenu', function (e) {
        EnvironmentId[0] = e.target.id;
<<<<<<< HEAD


        var menu = createMenu(e)
        .show();

=======
      

        var menu = createMenu(e)
        .show();
    
>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
        var left = e.pageX + 5, /* nudge to the right, so the pointer is covering the title */
            top = e.pageY;
        if (top + menu.height() >= $(window).height()) {
            top -= menu.height();
        }
        if (left + menu.width() >= $(window).width()) {
            left -= menu.width();
        }

        // Create and show menu
<<<<<<< HEAD
        menu.css({ zIndex: 1000001, left: left, top: top })
          .on('contextmenu', function () { return false; });

        // Cover rest of page with invisible div that when clicked will cancel the popup.
        var bg = $('<div></div>')
          .css({ left: 0, top: 0, width: '100%', height: '100%', position: 'absolute', zIndex: 1000000 })
          .appendTo(document.body)
          .on('contextmenu click', function () {
              // If click or right click anywhere else on page: remove clean up.
              bg.remove();
              menu.remove();
              return false;
          });

        // When clicking on a link in menu: clean up (in addition to handlers on link already)
        menu.find('a').click(function () {
            bg.remove();
            menu.remove();
        });

        // Cancel event, so real browser popup doesn't appear.
        return false;
    });

=======
        menu.css({zIndex:1000001, left:left, top:top})
          .on('contextmenu', function() { return false; });

        // Cover rest of page with invisible div that when clicked will cancel the popup.
        var bg = $('<div></div>')
          .css({left:0, top:0, width:'100%', height:'100%', position:'absolute', zIndex:1000000})
          .appendTo(document.body)
          .on('contextmenu click', function() {
              // If click or right click anywhere else on page: remove clean up.
              bg.remove();
              menu.remove();
              return false;
          });

        // When clicking on a link in menu: clean up (in addition to handlers on link already)
        menu.find('a').click(function() {
            bg.remove();
            menu.remove();
        });

        // Cancel event, so real browser popup doesn't appear.
        return false;
    });

>>>>>>> 0f3b14adbb6143d9eec33e477496e5e726f2d444
    return this;
};

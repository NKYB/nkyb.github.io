/*
 *  InfiniteCell v1.0 - it never ends
 *  
 *  Description
 *  Use InfiniteCell, a jquery plugin, to drag cells in any direction, 
 *  infinitely, with preloading of cells and unloading of cells for better 
 *  performance, it even has a little easing for your pleasure
 * 
 *  Installation
 *  add <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
 *  add <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
 *  add <script src="jquery.infinitecell.js"></script> (this file)
 *  call $('body').InfiniteCell({});
 *  
 *  Options
 *  - cell_width: the width of an individual cell
 *  - cell_height: the height of an individual cell
 *  - cell_padding: how many non visible cells to add (preload)
 *  - add_left: event when adding cells on the left
 *  - add_right: event when adding cells on the right
 *  - add_top: event when adding cells on the top
 *  - add_bottom: event when adding cells on the bottom
 *  - render_cell: html to render into your cell (cell content)
 *  
 *  Example
 *  $('body').InfiniteCell({
 *      cell_width: 400,
 *      cell_height: 400,
 *      cell_padding: 5,
 *      add_left: function(){
 *          console.log('InfiniteCell: add left');
 *      },
 *      add_right: function(){
 *          console.log('InfiniteCell: add right');
 *      },
 *      add_top: function(){
 *          console.log('InfiniteCell: add top');
 *      },
 *      add_bottom: function(){
 *          console.log('InfiniteCell: add bottom');
 *      },
 *      render_cell: function(self){
 *          var html = '';
 *          html += '<div style="width:100%;height:100%;background-color:'+self._get_random_color()+'"></div>';
 *          return html;
 *      }  
 *  });
 *  
 */

;(function ( $, window, document, console, undefined ) {
    var pluginName = "InfiniteCell";

    
    if(typeof(console) === 'undefined') {
        var console = {}
        console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
    }

    function Plugin( element, options, pluginName ) {
        this.element = element;
        var defaults = {
            cell_width: 400,
            cell_height: 400,
            cell_padding: 5,
            add_left: function(){},
            add_right: function(){},
            add_top: function(){},
            add_bottom: function(){},
            render_cell: function(self){
                var currentdate = new Date(); 
                var datetime = "Created: " 
                    + currentdate.getHours() + ":"  
                    + currentdate.getMinutes() + ":" 
                    + currentdate.getSeconds();
                var html = '';
                html += '<div style="width:100%;height:100%;padding:15px;font-size: 0.8em;font-family:Arial,Helvetica;background-color:'+self._get_random_color()+'">'+datetime+'</div>';
                return html;
            }
        };
        this.options = $.extend(defaults, options);

        $.proxy(this._init(),this);
        return this;
    }
    
    Plugin.prototype = {
        _init: function(){
            this.add_defualt_style();
            var doc_height = $(document).height();
            var doc_width = $(document).width();
            this.grid_size_x = (parseInt(doc_width / this.options.cell_width) + this.options.cell_padding);
            this.grid_size_y = (parseInt(doc_height / this.options.cell_height) + this.options.cell_padding);
            
            for(var x = 0; x < this.grid_size_x ; x++){
                for(var y = 0; y < this.grid_size_y; y++){
                    var top = ((y * this.options.cell_height) - (this.grid_size_y / 2 * this.options.cell_height)) + (doc_height / 2);
                    var left = ((x * this.options.cell_width) - (this.grid_size_x / 2 * this.options.cell_width)) + (doc_width / 2);
                    this.render_cell(top,left,this);
                }
            }

            this.init_offset_left = $('.infinite_cell').offset().left;
            this.init_offset_top = $('.infinite_cell').offset().top;
            
            var self = this;
            $('body').draggable({
                drag: function() {
                    var offset_left = self.get_left_offset() - self.init_offset_left;
                    var offset_top = self.get_top_offset() - self.init_offset_top;

                    if (offset_left > self.options.cell_width){
                        var left = self.get_left() - self.options.cell_width;
                        var basic_top = self.get_top();
                        for(var y = 0; y < self.grid_size_y; y++){
                            var top = basic_top + (self.options.cell_height * y);
                            self.render_cell(top,left,self);
                        }
                        var ref_right = self.get_right() - self.options.cell_width;
                        $('.infinite_cell').filter(function(){return parseInt($(this).css('left')) == ref_right;}).remove();
                        self.options.add_left();
                    }

                    if (offset_left < (-1)*self.options.cell_width){
                        var left = self.get_right();
                        var basic_top = self.get_top();
                        for(var y = 0; y < self.grid_size_y; y++){
                            var top = basic_top + (self.options.cell_height * y);
                            self.render_cell(top,left,self);
                        }
                        var ref_left = self.get_left();
                        $('.infinite_cell').filter(function(){return parseInt($(this).css('left')) == ref_left;}).remove();
                        self.options.add_right();
                    }

                    if (offset_top > self.options.cell_height){
                        var top = self.get_top() - self.options.cell_height;
                        for(var y = 0; y < self.grid_size_x; y++){
                            var left = self.get_left() + (self.options.cell_width * y);
                            self.render_cell(top,left,self);
                        }
                        var ref_bottom = self.get_bottom() - self.options.cell_height;
                        $('.infinite_cell').filter(function(){return parseInt($(this).css('top')) == ref_bottom;}).remove();
                        self.options.add_top();
                    }

                    if (offset_top < (-1)*self.options.cell_height){
                        var top = self.get_bottom();
                        for(var y = 0; y < self.grid_size_x; y++){
                            var left = self.get_left() + (self.options.cell_width * y);
                            self.render_cell(top,left,self);
                        }
                        var ref_top = self.get_top();
                        $('.infinite_cell').filter(function(){return parseInt($(this).css('top')) == ref_top;}).remove();
                        self.options.add_bottom();
                    }
                },
                stop: function(event, pos){
                    var drift = 50;
                    var ratioY = drift;
                    var ratioX = drift;
                    var diffX = pos.offset.left - pos.originalPosition.left;
                    var diffY = pos.offset.top - pos.originalPosition.top;
                    if (Math.abs(diffX) > Math.abs(diffY)){
                        ratioY = Math.abs(drift / diffX * diffY);
                    } else {
                        ratioX = Math.abs(drift / diffY * diffX);
                    }
                    
                    var newLocX = (diffX > 0)? pos.offset.left + ratioX : pos.offset.left - ratioX;
                    var newLocY = (diffY > 0)? pos.offset.top + ratioY : pos.offset.top - ratioY;
                    
                    $('body').animate({ left:newLocX, top:newLocY, useTranslate3d:true }, 500, 'easeOutQuad' );
                }
            });
        },
        add_defualt_style: function(){
            var html = '';
            html += '<style>';
            html += '   body{';
            html += '       overflow:hidden;';
            html += '   }';
            html += '   .infinite_cell{';
            html += '       position:absolute;';
            html += '       z-index:1;';
            html += '   }';
            html += '</style>';
            $('head').append( html );
        },
        render_cell: function(top,left,self){
            var html = '';
            html += '<div class="infinite_cell" style="top:'+top+'px;left:'+left+'px;width:'+this.options.cell_width+'px;height:'+this.options.cell_height+'px;">';
            html += self.options.render_cell(self);
            html += '</div>';
            $(this.element).append( html );
        },
        get_top_offset: function(){
            var top=1000000;
            $('.infinite_cell').each(function(){
                var local_top = parseInt($(this).offset().top );
                if (top > local_top){
                    top = local_top;
                }
            });
            return top;
        },
        get_top: function(){
            var top=1000000;
            $('.infinite_cell').each(function(){
                var local_top = parseInt($(this).position().top );
                if (top > local_top){
                    top = local_top;
                }
            });
            return top;
        },
        get_left_offset: function(){
            var left=1000000;
            $('.infinite_cell').each(function(){
                var local_left = parseInt($(this).offset().left );
                if (left > local_left){
                    left = local_left;
                }
            });
            return left;
        },
        get_left: function(){
            var left=1000000;
            $('.infinite_cell').each(function(){
                var local_left = parseInt($(this).position().left );
                if (left > local_left){
                    left = local_left;
                }
            });
            return left;
        },
        get_right: function(){
            var right=-10000000;
            var cell_width = this.options.cell_width;
            $('.infinite_cell').each(function(){
                var local_right = parseInt($(this).position().left + cell_width);
                if (right < local_right){
                    right = local_right;
                }
            });
            return right;
        },
        get_bottom: function(){
            var bottom=-10000000;
            var cell_height = this.options.cell_height;
            $('.infinite_cell').each(function(){
                var local_bottom = parseInt($(this).position().top + cell_height);
                if (bottom < local_bottom){
                    bottom = local_bottom;
                }
            });
            return bottom;
        },
        count_cells: function(){
            var count=0;
            $('.infinite_cell').each(function(){
                count++;
            });
            return count;
        },
        _get_random_color: function() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
    };

    $.fn[pluginName] = function ( options ) {
        return new Plugin( this, options, pluginName );
    };
})( jQuery, window, document, console );
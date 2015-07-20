/**
 * Sprite animation class
 *
 *
 *
 * @namespace
 * @name sprite.js
 * @author Rick Ootes | Code d'Azur
 * @date: 20/07/15
 */


 (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.b);
    }
}(this, function ($) {

    'use strict';

    var Sprite,
        defaults;

    defaults = {
        fps: 60,
        columns: 0,
        rows: 0,
        frames: 0,
        sprites: [],
        ratio: 1.5,
        autoPlay: false,
        loop: false
    };

    // create unique IDs for elements without id
    var UID = Date.now();
    var uniqueId = function () {
        return (UID++).toString(36);
    };

    /**
     * Represents an Sprite animation.
     * @constructor
     * @param {string} selector - The html element or selector.
     * @param {object} options - Extend the defaults with these options
    */
    Sprite = function (el, options) {

        this.$el = $(el);

        // Extend default options
        this.options = $.extend({}, defaults, options);

        // Sets the id, generates an id when there's no id attribute
        this.id = this.options.id || this.$el.attr('id') || uniqueId();

        // Holds the generated with and height of the container
        this.container = {};
        
        // Set default states
        this.state = {
            loaded: false,
            playing: false,
            ended: false
        };

        this.init();
    
    }


    Sprite.prototype = { 

        /** 
        *   @var {Integer} Remember the count of the loaded sprites
        *   {Integer} 
        */
        loaded: 0,

        /** 
        *   @var {Integer} Remember the current frame
        */
        currentFrame: 0,


        /** 
        *   Contructor method
        *
        *   @return void
        */
        init: function () {

            var self = this;

            this.loadSprites(function () {
                self.setState('loaded', true);

                self.createContainer();

                if(self.options.autoPlay){
                    self.play();    
                }
                
            });

            this.enable();
            this.setHeight();

        },

        /** 
        *   Add events
        *
        *   @return void
        */
        enable: function () {

            $(window)
                .on('resize.' + this.id, $.proxy(this, 'onResize'))
                .on('orientationchange.' + this.id, $.proxy(this, 'onResize'));

        },

        /** 
        *   Destroy events
        *
        *   @return void
        */
        disable: function () {

            $(window).off('.' + this.id);

        },  

        /** 
        *   Destroy element and destroy events
        *
        *   @return void
        */
        destroy: function () {

            this.$el.empty();
            this.disable();

        },

        /** 
        *   Create container and appends the spritesheets
        *
        *   @return void
        */
        createContainer: function () {

            var container = $('<div class="sprite-container"></div>');

            this.$el.append(container);

            this.setContainerWidth()

            for(var i = 0; i < this.options.sprites.length; i++){

                var img = new Image();
                img.src = this.options.sprites[i];

                this.$el.find('.sprite-container').append(img);

            }
        },

        /** 
        *   Set the width of the container
        *
        *   @return void
        */
        setContainerWidth: function () {

            if(!this.$el.find('.sprite-container').length) return;

            this.$el.find('.sprite-container')
                .width(this.container.width * (this.$el.width() / this.options.frameWidth))
                .height(this.container.height * (this.$el.width() / this.options.frameWidth));

        },

        /** 
        *   Set the state of the class and trigger an event
        *
        *   @return void
        */
        setState: function (key, value) {

            // trigger only on changed states
            if(this.state[key] === value) return;

            this.state[key] = value;
            this.$el.trigger(key, value);

        },

     
        /** 
        *   Resize handler
        *
        *   @return void
        */
        onResize: function () {

            var self = this;

            if(this.resizeTimeout) clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(function () {
                
                self.setHeight();  
                self.setContainerWidth();  
                self.setFrame(self.currentFrame);

            }, 300)
            

        },

        /** 
        *   Set the height of the element based on this.options.ratio
        *
        *   @return void
        */
        setHeight: function () {

            var ratio = this.options.ratio;
            this.$el.height(this.$el.width() / ratio);            

        },

        /** 
        *   Load all sprites defined in this.options.sprites
        *
        *   @param {method} Callback which is fired when all sprites are loaded
        *
        *   @return void
        */
        loadSprites: function (callback) {

            var sprites = this.options.sprites;
            
            for(var i = 0; i < sprites.length; i++){

                var url,
                    img;

                url = sprites[i];
                img = new Image();

                $(img)
                    .one('load', $.proxy(this, 'onSpriteLoaded', callback))
                    .one('error', $.proxy(this, 'onSpriteError'));

                img.src = url;

            }

        },  

        /** 
        *   Callback when a sprite is loaded 
        *
        *   @param {method} Callback which is fired when all sprites are loaded
        *   @param {object} The event object
        *
        *   @return void
        */
        onSpriteLoaded: function (callback, e) {


            this.container.width = e.target.width;
            this.container.height = (this.container.height || 0) + e.target.height;
            
            this.loaded++;
            if(this.options.sprites.length !== this.loaded) return;

            if($.isFunction(callback)){
                callback();
            }


        },

        /** 
        *   Callback when a sprite failed to load
        *
        *   @param {object} The event object
        *
        *   @return Exception
        */
        onSpriteError: function (e) {
            
            throw "Sprite failed to load";

        },

        /** 
        *   Sets the given frame
        *
        *   @param {integer} The index of the frame
        *
        *   @return void
        */
        setFrame: function (index) {

            var x = - (this.options.frameWidth * (this.$el.width() / this.options.frameWidth)) * (index % this.options.columns),
                y = - (this.options.frameHeight * (this.$el.width() / this.options.frameWidth)) * Math.floor(index / this.options.columns);


            if(this.hasTransform()){

                this.$el.find('.sprite-container').css({
                    '-webkit-transform': 'translate('+ x +'px, '+ y +'px)',
                    '-ms-transform': 'translate('+ x +'px, '+ y +'px)',
                    'transform': 'translate('+ x +'px, '+ y +'px)'
                });

            }else{

                this.$el.find('.sprite-container').css({
                    left: x + 'px',
                    top: y + 'px',
                    position: 'absolute'
                });

            }

        },

        /** 
        *   Check if the browser supports css3 transform 
        *
        *   @return boolean
        */
        hasTransform: function () {

            var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
            var div = document.createElement('div');
            
            for(var i = 0; i < prefixes.length; i++) {
                if(div && div.style[prefixes[i]] !== undefined) {
                    return prefixes[i];
                }
            }
            return false;
        },

        /** 
        *   Sets the given frame and start playing
        *
        *   @param {integer} The index of the frame
        *
        *   @return void
        */
        goToAndPlay: function (index) {

            this.currentFrame = index;
            this.play();

        },

        /** 
        *   Play the animation
        *
        *   @return void
        */
        play: function () {

            var ms = 1000 / this.options.fps;

            this.setState('playing', true);
            this.setState('ended', false);

            if(this.currentFrame >= this.options.frames -1 && !this.options.loop){
                this.setState('ended', true);
                this.setState('playing', false);
                return;  
            }else if(this.currentFrame >= this.options.frames- 1 && this.options.loop){
                this.currentFrame = 0;
            }

            this.setFrame(this.currentFrame);
            this.currentFrame++;

            this.ticker = setTimeout($.proxy(this, 'play'), ms);
            

        },

        /** 
        *   Pause the animation
        *
        *   @return void
        */
        pause: function () {

            if(this.ticker){
                clearInterval(this.ticker);
                this.setState('playing', false);
            }

        }
    }
    
    return Sprite;
}));
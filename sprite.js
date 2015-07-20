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
        frameWidth: null,
        frameHeight: null,
        sprites: [],
        ratio: 1.5,
        autoPlay: false,
        loop: false,
        loopDelay: 0
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

        // Push loaded images in an array
        this.cache = [];
        
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
        *   @var {Integer} Remember the current frame
        */
        currentFrame: 0,

        /** 
        *   @var {array} Stores loaded images
        */
        images: [],


        /** 
        *   Contructor method
        *
        *   @return void
        */
        init: function () {

            var self = this;

            // Skip initiation if canvas is not supported
            if(!this.canvasSupported()) return;

            this.loadSprites(function () {
                self.setState('loaded', true);

                self.createCanvas();

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
         * Is canvas supported
         *
         * @returns {boolean} Is canvas supported
         */

        canvasSupported: function () {
            if (document.createElement('canvas').getContext === undefined) {
                return false;
            } else if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(GT-P5110)|(Windows Phone (OS 7))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
                return false;
            }

            return true;
        },

        /** 
        *   Create canvas and appends the spritesheets
        *
        *   @return void
        */
        createCanvas: function () {

            var canvas = $('<canvas class="sprite-canvas" id="canvas-'+ this.id +'"></canvas>');
            this.$el.append(canvas);
            this.canvas = this.$el.find("#canvas-" + this.id);
            this.context = this.canvas[0].getContext('2d');

            this.setCanvasSize();


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
                self.setCanvasSize();
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


        setCanvasSize: function () {

            if(!this.$el.find('canvas').length) return;

            var width = $(window).width() * (this.$el.width() / this.options.frameWidth),
                height = width / this.options.ratio;

             this.$el.find('canvas')
                .attr('width', width)
                .attr('height', height);

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
            
            this.cache.push(e.target);

            if(this.options.sprites.length !== this.cache.length) return;

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

            var self = this;

            var spriteIndex = Math.floor(index / (this.options.columns * this.options.rows)),
                index = index % (this.options.columns * this.options.rows),
                img = this.getCachedImage(spriteIndex),
                sx = this.options.frameWidth * (index % this.options.columns),
                sy = this.options.frameHeight * Math.floor(index / this.options.columns),
                swidth = this.options.frameWidth,
                sheight = this.options.frameHeight,
                x = 0,
                y = 0,               
                width = this.options.frameWidth * (this.canvas.width() / this.options.frameWidth),
                height = this.options.frameHeight * (this.canvas.width() / this.options.frameWidth);
            
            self.context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);            

          
        },

        /**
         * Get the cached image by index
         *  @param {integer} index
         *
         *
         *  @return {object} html image object
         */
        getCachedImage: function (index) {

            var url = this.options.sprites[index],
                result = this.cache.filter(function (val) {
                    return val.src.indexOf(url) > -1;
                });

            return result[0];

        },

        /**
         * Clear the canvas
         */

        clearCanvas: function () {
            if (this.context) {
                this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
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

            if(this.currentFrame > this.options.frames -1 && !this.options.loop){
                this.setState('ended', true);
                this.setState('playing', false);
                return;  
            }else if(this.currentFrame > this.options.frames- 1 && this.options.loop){

                if(this.options.loopDelay > 0){

                    this.currentFrame = 0;
                    setTimeout($.proxy(this, 'play'), this.options.loopDelay);
                    return;

                }else{
                    this.currentFrame = 0;    
                }
                

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
require.config({
    baseUrl: "./",
    paths: {
        'jquery': '../../bower_components/jquery/dist/jquery',
        'CodeDeSprite': '../../code-de-sprite',
    },
    shim: {}
});

require(['CodeDeSprite'], function(CodeDeSprite) {

    new CodeDeSprite('.sprite', {
        fps: 30,
        columns: 4,
        rows: 4,
        frames: 43,
        frameWidth: 250,
        frameHeight: 200,
        sprites: [
            'sprites/sprite-0.gif',
            'sprites/sprite-1.gif',
            'sprites/sprite-2.gif'
        ],
        ratio: 1.25,
        autoPlay: true,
        loop: true,
        loopDelay: 0
    });

});
# Code de Sprite
Code de Sprite gives a simple interface to use sprites on your webpage.   
At the moment it has an jQuery dependency but it will be stand alone in future updates. 

## Quickstart
Install the pacakge via Bower
`bower install Code-de-sprite`

Include the module within your AMD structure.    
Invoke a new instance with the `new` operator.

```javascript
	 new CodeDeSprite(target, options);
```

The target property has to contain the HTML element that will function as the container of the Sprite class (or a selector string).

## Options
| Name          | Default       | Type           |  Description                                      |
| ------------- |---------------| ---------------|---------------------------------------------------|
| fps           | 60            | Integer        |  Amount of frame per second                       |
| columns       | 0             | Integer        |  The amount of columns per spritesheet            |
| rows          | 0             | Integer        |  The amount of rows per spritesheet               |
| frames        | 0             | Integer        |  The amount frames in all spritesheets combined   |                               
| frameWidth    | null          | Integer        |  The width of a frame in px                       |                               
| frameHeight   | null          | Integer        |  The height of a frame in px                      |                               
| sprites *     | []            | Array          |  An array with all the Spritesheets               |                               
| ratio         | 1.5           | Float          |  Width to height ratio of the animation           |
| autoplay      | false         | Boolean        |  Should the animation automaticly play?           |
| loop          | false         | Boolean        |  Should the animation loop?                       | 
| loopDelay     | 0             | Integer        |  A delay between the restart of the animation     | 
| actions **    | null          | Object         |  A hook for the actions interface                 |

\* Some older devices don't support spritesheets above 1024px x 1024px, therefor there's the option to add multiple spritesheets    
\** See the "Actions" chapter for more information

## Callbacks
There are several states of the sprite animation class. Each state triggers an event and executes an method (if defined in the options object). The following states are available:

- loaded
- playing
- ended

For example if we wan't to know when all Sprites are loaded we use the following syntax:

```javascript
	 new CodeDeSprite('.target', {
	 	fps: 60,
	 	columns: 3,
	 	rows: 3,
	 	frames: 27,
	 	frameWidth: 100,
	 	frameHeight: 100,
	 	sprites: [
	 		'/assets/img/sprite-0.png',
	 		'/assets/img/sprite-1.png',
	 		'/assets/img/sprite-2.png'
	 	],
	 	ratio: 1.5,
	 	autoPlay: false,
	 	loop: false,
	 	loopDelay: false,
	 	loaded: function () {
	 		alert('Sprites are loaded')	
	 	}
	 });
```

## Actions
There's an action interface to controll the animation.    
Currently there are 2 actions available: `play` and `pause`.

The keys of the objects represent the action to execute and the value represents the selector.  
For example: If the user click on the `.play` element the play method is executed. 

```javascript
	actions: {
		play: '.play',
		pause: '.pause'
	}
```
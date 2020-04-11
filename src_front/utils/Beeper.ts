export default class Beeper {
	
	private static _instance:Beeper;

	private audioCtx:AudioContext;
	
	constructor() {
		this.initialize();
	}
	
	
	
	/********************
	 * GETTER / SETTERS *
	 ********************/
	
	/**
	 * Gets the singleton's reference
	 */
	public static get instance():Beeper {
		if(!this._instance) this._instance = new Beeper();
		return this._instance;
	}

	public get ready():boolean {
		return this.audioCtx != null;
	}
	
	
	
	/******************
	 * PUBLIC METHODS *
	 ******************/
	
	public beep(duration, frequency=440, volume=1, type:any=null, callback=null) {
		var oscillator = this.audioCtx.createOscillator();
		var gainNode = this.audioCtx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(this.audioCtx.destination);

		if (volume){gainNode.gain.value = volume;}
		if (frequency){oscillator.frequency.value = frequency;}
		if (type){oscillator.type = type;}
		if (callback){oscillator.onended = callback;}

		oscillator.start(this.audioCtx.currentTime);
		oscillator.stop(this.audioCtx.currentTime + ((duration || 500) / 1000));
	};
	
	
	
	/*******************
	 * PRIVATE METHODS *
	 *******************/
	/**
	 * Initializes the class
	 */
	private initialize():void {
		document.addEventListener("mousedown", _=> {
			//@ts-ignoreain
			this.audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
		})
	}
}
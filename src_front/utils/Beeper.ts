import Utils from './Utils';

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
	public async beepPatern(patern:{d:number, f?:number, v?:number, t?:string, p?:number}[], volumeOverride?:number):Promise<void> {
		for (let i = 0; i < patern.length; i++) {
			const p = patern[i];
			if(volumeOverride) p.v = volumeOverride;
			await this.beep(p.d, p.f, p.v, p.t);
			if(p.p) {
				await Utils.promisedTimeout(p.p);
			}
		}
	}
	
	public beep(duration:number, frequency:number=440, volume:number=1, type:any="sine"):Promise<void> {
		return new Promise((resolve, reject) => {
			let oscillator = this.audioCtx.createOscillator();
			let gainNode = this.audioCtx.createGain();
	
			oscillator.connect(gainNode);
			gainNode.connect(this.audioCtx.destination);
	
			if (volume){gainNode.gain.value = volume;}
			if (frequency){oscillator.frequency.value = frequency;}
			if (type){oscillator.type = type;}
			oscillator.onended = _=> resolve();
	
			oscillator.start(this.audioCtx.currentTime);
			oscillator.stop(this.audioCtx.currentTime + ((duration || 500) / 1000));
		})
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

/**
 * Created by Durss
 */
export default class Config {

	public static IS_PROD:boolean = /.*\.(com|fr|net|org|ninja)$/gi.test(window.location.hostname) || window.location.hostname.indexOf("192.168") > -1;
	public static ENABLE_INTRO_ANIMATIONS:boolean = false || Config.IS_PROD;
	public static STORAGE_VERSION:number = 1;
	public static TIME_RENDER_RATIO:number = 1/120;
	
	private static _ENV_NAME: EnvName;

	public static init():void {
		let prod = document.location.port == "";

		if(prod) this._ENV_NAME = "prod";
		else this._ENV_NAME = "dev";
	}
	
	public static get SERVER_PORT(): number {
		return this.getEnvData({
			dev: 3006,
			prod: document.location.port,
		});
	}
	
	public static get SOCKET_PATH():string{
		if(this.IS_PROD) {
			return "/sock";
		}else{
			return window.location.origin.replace(/(.*):[0-9]+/gi, "$1")+":3006/sock";
		}
	};
	
	public static get API_PATH(): string {
		return this.getEnvData({
			dev: "http://localhost:"+this.SERVER_PORT+"/api",
			prod:"/api",
		});
	}
	

	/**
	 * Extract a data from an hasmap depending on the current environment.
	 * @param map
	 * @returns {any}
	 */
	private static getEnvData(map: any): any {
		//Get the data from hashmap
		if (map[this._ENV_NAME]) return map[this._ENV_NAME];
		return map[Object.keys(map)[0]];
	}
}

type EnvName = "dev" | "preprod" | "prod" | "standalone";
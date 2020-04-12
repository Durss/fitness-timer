<template>
	<div class="timer">
		<Button :icon="require('@/assets/icons/back.svg')" class="back" :to="{name:'home'}" big />
		<div class="head">
			<h1>{{routine.name}}</h1>
			<h2>{{totalDurationFormated}}</h2>
		</div>
		<div class="list" v-if="!needClick">
			<TimelineNode v-for="(s, index) in steps" :key="index" :data="s" />
			<div class="arrow" :style="arrowPos" ref="arrow">
				<img src="@/assets/icons/arrow.svg" alt="arrow">
			</div>
		</div>
		<div class="label" ref="label" :style="labelStyles" v-if="!needClick">
			<span class="exercise">{{currentStepLabel}}</span>
			<span class="duration">{{currentDuration}}</span>
		</div>

		<Button v-if="needClick" title="Click to start" class="big" highlight @click="startTimer()" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import RoutineData from '../vo/RoutineData';
import TimelineNode from '../components/TimelineNode.vue';
import StepData from '../vo/StepData';
import Utils from '../utils/Utils';
import Config from '../utils/Config';
import Beeper from '../utils/Beeper';
import Button from '../components/Button.vue';

@Component({
	components:{
		Button,
		TimelineNode,
	}
})
export default class Timer extends Vue {

	@Prop()
	public id:any;

	public steps:any = [];
	public timings:{time:number, data?:StepData}[] = [];
	public complete:boolean = false;
	public needClick:boolean = false;
	public disposed:boolean = false;
	public elapsed:number = 0;
	public totalDuration:number = 0;
	public labelPos:number = 0;
	public currentStepData:any = null;
	public currentStepLabel:string = "";
	public currentStepCounter:number = 0;

	public routine!:RoutineData;
	public startTime!:Date;
	public startExerciseTime!:Date;
	public beeps:number[] = [];

	public get totalDurationFormated():string {
		return Utils.secondsToInputValue(Math.max(0,this.totalDuration - this.elapsed));
	}

	public get arrowPos():any {
		return {
			top:(this.elapsed*Config.TIME_RENDER_RATIO)+"px",
		}
	}

	public get labelStyles():any {
		return {
			top:Math.round(this.labelPos)+"px",
		}
	}

	public get currentDuration():string {
		return Utils.secondsToInputValue(Math.ceil(Math.max(0,this.currentStepCounter)));
	}

	public beforeMount():void {
		this.needClick = !Beeper.instance.ready;
		let routines = this.$store.state.routines;
		if(routines && routines.length > 0) {
			for (let i = 0; i < routines.length; i++) {
				const r = routines[i];
				if(r.id == this.id) {
					this.routine = r;
				}
			}
		}
		if(!this.routine) {
			this.$router.push({name:"home"});
			return;
		}
		
		//PREPARE DATA STRUCTURE TO BUILD TIMELINE
		let prepDuration = 10000;
		this.steps.push({type:"node", label:"Get Ready"});
		this.steps.push({type:"path", duration:prepDuration});
		this.timings.push({time:0, data:{id:"start", duration:prepDuration}});
		let delay = prepDuration;
		this.totalDuration += delay;
		let loops:number = this.routine.loops? this.routine.loops : 0;
		for (let j = 0; j < loops; j++) {
			//Add step
			for (let i = 0; i < (<StepData[]>this.routine.steps).length; i++) {
				const s:StepData = <StepData>this.routine.steps?.[i];
				this.steps.push({type:"node", label:s.name});
				this.steps.push({type:"path", duration:s.duration});
				this.timings.push({time:delay, data:s});
				let t = s.duration? s.duration : 0;
				this.totalDuration += t;
				delay += t;
			}
			//Add pauses
			if(j < loops-1) {
				this.steps.push({type:"node", label:"Pause"});
				this.steps.push({type:"path", duration:this.routine.pauseDuration});
				this.timings.push({time:delay, data:{id:"pause", duration:this.routine.pauseDuration}});
				let t = this.routine.pauseDuration? this.routine.pauseDuration : 0;
				this.totalDuration += t;
				delay += t;
			}
		}
		this.steps[this.steps.length-1].isLast = true;
		this.steps.push({type:"node", label:"Finish"});
		this.timings.push({time:delay, data:{id:"complete", duration:0}});

		if(!this.needClick) {
			this.startTimer();
		}
		requestAnimationFrame(_=>this.renderFrame());
	}

	public startTimer():void {
		this.needClick = false;
		this.startTime = new Date();
		this.programBeeps();
	}

	public beforeDestroy():void {
		this.disposed = true;
		//Cleanup programmed beeps
		for (let i = 0; i < this.beeps.length; i++) {
			clearTimeout(this.beeps[i]);
		}
	}

	private renderFrame():void {
		if(this.disposed || this.complete) return;
		requestAnimationFrame(_=>this.renderFrame());
		if(this.needClick) return;

		this.elapsed = new Date().getTime() - this.startTime.getTime();
		let currentStep!:StepData;
		for (let i = 0; i < this.timings.length; i++) {
			const e = this.timings[i];
			if(e.time >= this.elapsed) {
				currentStep = <StepData>this.timings[i-1].data;
				if(this.currentStepData != currentStep) {
					this.currentStepData = currentStep;
					this.startExerciseTime = new Date();
				}
				break;
			}
		}
		
		let id = currentStep? currentStep.id : "complete";
		switch(id) {
			case "start":
				this.currentStepLabel = "⏱ Get Ready ⏱";
				break;
			case "pause":
				this.currentStepLabel = "⏳ Relax ⏳";
				break;
			case "complete":
				this.complete = true;
				this.currentStepLabel = "👏 Finish 👏";
				break;
			default:
				this.currentStepLabel = currentStep.name;

		}
		this.currentStepCounter = Math.ceil(this.currentStepData.duration - (new Date().getTime() - this.startExerciseTime.getTime()));

		let arrow:HTMLDivElement = <HTMLDivElement>this.$refs.arrow;
		let bounds = arrow.getBoundingClientRect();
		let cY = window.innerHeight * .35;
		
		this.labelPos = bounds.top + 10;

		if(bounds.top > cY) {
			//Wait for arrow to be placed 
			this.$nextTick().then(_=> {
				window.scrollBy(0, Math.round(bounds.top - cY));
			});
		}
		
	}

	/**
	 * Oscillator is slow to initialize and start beeping (~500ms)
	 * that's why all beeps are pre programmed from the beggining
	 * 500ms earlier before they should play so they appear synced
	 * with the textual timer
	 */
	public programBeeps():void {
		let delay = 0;
		for (let i = 0; i < this.timings.length; i++) {
			const t = this.timings[i];
			switch(t.data.id) {
				case "start":
				case "pause":
					if(t.data.id == "pause") {
						this.beeps.push(setTimeout(async _=> {
							Beeper.instance.beepPatern([{d:100, f:1000, p:10}, {d:500, f:1000}]);
						}, delay - 500));
					}else{
						// Beeper.instance.beep(200, 1500);
					}
				
					//Start beeping 7s before pause ends
					if(t.data.duration >= 10000) {
						this.beeps.push(setTimeout(async _=> {
							await Beeper.instance.beepPatern([{d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}], .15);
							await Beeper.instance.beepPatern([{d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}]);
						}, Math.max(0,t.data.duration - 8500) + delay));
					}
					break;
					
				case "complete":
					this.beeps.push(setTimeout(async _=> {
						Beeper.instance.beepPatern([{d:50, f:1700}, {d:100, f:2000}, {d:50, f:2200}, {d:50, f:2600}, {d:500, f:3000}]);
					}, delay - 500));
					break;

				default:
					this.beeps.push(setTimeout(async _=> {
						Beeper.instance.beep(500, 1500, 1, "sine");
					}, delay - 500));
					//Start beeping 5s before end of exercise
					if(t.data.duration > 7000) {
						this.beeps.push(setTimeout(async _=> {
							await Beeper.instance.beepPatern([{d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}], .15);
						}, Math.max(0,t.data.duration - 5500) + delay));
					}

			}
			delay += t.data.duration;
		}

	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.timer {
	.back {
		position: fixed;
		top: 0;
		left: 0;
		border-radius: 0;
		border-bottom-right-radius: 30px;
		z-index: 3;
	}

	.head {
		top: 5px;
		z-index: 1;
		position: sticky;
		z-index: 2;
		margin: auto;
	}

	.list {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: 30px;
		margin-bottom: 30px;
		position: relative;

		&>div{
			&:not(.first-child):not(.arrow) {
				margin-top: -25px;
				color: red;
			}
		}

		.arrow {
			position: absolute;
			width: 30vw;
			top: 0;
			right: 50%;
			z-index: 2;
			transform: translate(0, -50%);
			text-align: right;
			filter: drop-shadow(0 5px 2px rgba(0,0,0,.2));
			img {
				height: 20px;
				margin-left: -1px;
			}
		}
	}

	.label {
		position: fixed;
		font-family: "Futura", Helvetica, Arial, sans-serif;
		font-weight: bold;
		font-size: 40px;
		background-color: white;
		padding: 10px 20px;
		border-radius: 15px;
		right: 50%;
		text-align: center;
		z-index: 2;
		max-width: 40vw;
		transform: translate(-17px, -50%) translateZ(0);
		filter: drop-shadow(0 5px 2px rgba(0,0,0,.2));
		display: flex;
		flex-direction: column;

		.duration {
			font-size: 25px;
			margin-top: 10px;
		}
	}
}

@media only screen and (max-width: 500px) {
	.timer{
		.back.big {
			border-radius: 0;
			border-bottom-right-radius: 15px;
			width: 65px;
			height: 65px;
		}

		.head {
			width: 100%;
			top: 0;
			// vertical-align: middle;
			// align-items: center;
			// justify-content: center;
			h1 {
				height: 65px;
				display: block;
				border-radius: 0;
				padding: 0;
				padding: 0 70px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.label {
			font-size: 25px;
			.duration {
				font-size: 18px;
			}
		}
	}
}
</style>
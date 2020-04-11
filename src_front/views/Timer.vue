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

		<Button v-if="needClick" title="Click to start" class="big" highlight @click="needClick = false;" />
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

	public get totalDurationFormated():string {
		return Utils.secondsToInputValue(this.totalDuration - this.elapsed);
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
		return Utils.secondsToInputValue(this.currentStepCounter);
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

		this.steps.push({type:"node", label:"Get Ready"});
		this.steps.push({type:"path", duration:5000});
		this.timings.push({time:0, data:{id:"start", duration:5000}});
		let delay = 5000;
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

		this.startTime = new Date();
		this.startTime.setSeconds(this.startTime.getSeconds() - 10*0);

		requestAnimationFrame(_=>this.renderFrame());
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	private renderFrame():void {
		if(this.disposed) return;
		requestAnimationFrame(_=>this.renderFrame());
		if(this.needClick) return;

		this.elapsed = new Date().getTime() - this.startTime.getTime();
		let currentStep!:StepData;
		for (let i = 0; i < this.timings.length; i++) {
			const e = this.timings[i];
			if(e.time > this.elapsed) {
				if(i > 0) {
					currentStep = <StepData>this.timings[i-1].data;
					if(this.currentStepData != currentStep) {
						this.currentStepData = currentStep;
						this.startExerciseTime = new Date();
						if(currentStep.id) {
							//Exercise
							Beeper.instance.beep(100, 1500, 1, "sine");
						}else{
							//pause
							Beeper.instance.beep(500, 1000, 1, "sine");
						}
					}
				}
				break;
			}
		}
		
		switch(currentStep.id) {
			case "start":
				this.currentStepLabel = "⏱ Get Ready ⏱";
				break;
			case "pause":
				this.currentStepLabel = "⏳ Relax ⏳";
				break;
			case "complete":
				this.currentStepLabel = "👏 Finish 👏";
				break;
			default:
				this.currentStepLabel = currentStep.name;

		}
		this.currentStepCounter = this.currentStepData.duration - (new Date().getTime() - this.startExerciseTime.getTime());

		//Wait for arrow to be placed 
		let arrow:HTMLDivElement = <HTMLDivElement>this.$refs.arrow;
		let bounds = arrow.getBoundingClientRect();
		let cY = window.innerHeight * .35;
		
		this.labelPos = bounds.top + 10;

		if(bounds.top > cY) {
			this.$nextTick().then(_=> {
				window.scrollBy(0, Math.floor(bounds.top - cY));
			});
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
		font-size: 50px;
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
			font-size: 30px;
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
			font-size: 30px;
			.duration {
				font-size: 18px;
			}
		}
	}
}
</style>
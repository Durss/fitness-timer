<template>
	<div class="timer">
		<Button :icon="require('@/assets/icons/back.svg')" class="back" :to="{name:'home'}" big />
		<div class="head">
			<h1>{{routine?.name}}</h1>
			<h2>{{totalDurationFormated}}</h2>
		</div>
		<div class="list" v-if="!needClick">
			<div class="inner" ref="list" :style="scrollStyles">
				<TimelineNode v-for="(s, index) in steps" :key="index" :data="s" />
			</div>
		</div>
		<div class="label" ref="label" :style="labelStyles" v-if="!needClick">
			<span class="exercise">{{currentStepLabel}}</span>
			<span class="duration">{{currentDuration}}</span>
			<div class="arrow">
				<img src="@/assets/icons/arrow.svg" alt="arrow">
			</div>
		</div>

		<Button v-if="needClick" title="Click to start" class="big" highlight @click="startTimer()" />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import RoutineData from '../vo/RoutineData';
import TimelineNode from '../components/TimelineNode.vue';
import StepData from '../vo/StepData';
import Utils from '../utils/Utils';
import Beeper from '../utils/Beeper';
import Button from '../components/Button.vue';

const props = defineProps<{
	id:any;
}>();

const store = useStore();
const router = useRouter();

const steps = ref<any[]>([]);
const needClick = ref(false);
const elapsed = ref(0);
const totalDuration = ref(0);
const scrollY = ref(0);
const labelPos = ref(0);
const currentStepLabel = ref("");
const currentStepCounter = ref(0);
const routine = ref<RoutineData|null>(null);
const list = ref<HTMLDivElement|null>(null);

const timings:{time:number, data?:StepData}[] = [];
let complete = false;
let disposed = false;
let currentStepData:any = null;
let startTime:Date;
let startExerciseTime:Date;
const beeps:number[] = [];

const totalDurationFormated = computed<string>(() => {
	return Utils.secondsToInputValue(Math.max(0,totalDuration.value - elapsed.value));
});

const labelStyles = computed<any>(() => {
	return {
		top: labelPos.value+"px",
	}
});

const currentDuration = computed<string>(() => {
	return Utils.secondsToInputValue(Math.ceil(Math.max(0,currentStepCounter.value)));
});

const scrollStyles = computed<any>(() => {
	return {
		marginTop: -scrollY.value+"px",
	}
});

onBeforeMount(() => {
	needClick.value = !Beeper.instance.ready;
	let routines = store.state.routines;
	if(routines && routines.length > 0) {
		for (let i = 0; i < routines.length; i++) {
			const r = routines[i];
			if(r.id == props.id) {
				routine.value = r;
			}
		}
	}
	if(!routine.value) {
		router.push({name:"home"});
		return;
	}

	//PREPARE DATA STRUCTURE TO BUILD TIMELINE
	let prepDuration = 10000;
	steps.value.push({type:"node", label:"Get Ready"});
	steps.value.push({type:"path", duration:prepDuration});
	timings.push({time:0, data:{id:"start", duration:prepDuration}});
	let delay = prepDuration;
	totalDuration.value += delay;
	let loops:number = routine.value.loops? routine.value.loops : 0;
	for (let j = 0; j < loops; j++) {
		//Add step
		for (let i = 0; i < (<StepData[]>routine.value.steps).length; i++) {
			const s:StepData = <StepData>routine.value.steps?.[i];
			steps.value.push({type:"node", label:s.name});
			steps.value.push({type:"path", duration:s.duration});
			timings.push({time:delay, data:s});
			let t = s.duration? s.duration : 0;
			totalDuration.value += t;
			delay += t;
		}
		//Add pauses
		if(j < loops-1) {
			steps.value.push({type:"node", label:"Pause"});
			steps.value.push({type:"path", duration:routine.value.pauseDuration});
			timings.push({time:delay, data:{id:"pause", duration:routine.value.pauseDuration}});
			let t = routine.value.pauseDuration? routine.value.pauseDuration : 0;
			totalDuration.value += t;
			delay += t;
		}
	}
	steps.value[steps.value.length-1].isLast = true;
	steps.value.push({type:"node", label:"Finish"});
	timings.push({time:delay, data:{id:"complete", duration:0}});

	if(!needClick.value) {
		startTimer();
	}
	requestAnimationFrame(_=>renderFrame());
});

function startTimer():void {
	needClick.value = false;
	startTime = new Date();
	// startTime.setSeconds(startTime.getSeconds() - 535);//TODO comment that debug
	programBeeps();
}

onBeforeUnmount(() => {
	disposed = true;
	//Cleanup programmed beeps
	for (let i = 0; i < beeps.length; i++) {
		clearTimeout(beeps[i]);
	}
	Beeper.instance.stopAll();
});

function renderFrame():void {
	if(disposed || complete) return;
	requestAnimationFrame(_=>renderFrame());
	if(needClick.value) return;

	elapsed.value = new Date().getTime() - startTime.getTime();
	let currentStep!:StepData;
	for (let i = 0; i < timings.length; i++) {
		const e = timings[i];
		if(e.time >= elapsed.value) {
			currentStep = <StepData>timings[i-1].data;
			if(currentStepData != currentStep) {
				currentStepData = currentStep;
				startExerciseTime = new Date();
			}
			break;
		}
	}

	let id = currentStep? currentStep.id : "complete";
	switch(id) {
		case "start":
			currentStepLabel.value = "⏱ Get Ready ⏱";
			break;
		case "pause":
			currentStepLabel.value = "⏳ Relax ⏳";
			break;
		case "complete":
			complete = true;
			currentStepLabel.value = "👏 Finish 👏";
			break;
		default:
			currentStepLabel.value = currentStep.name;

	}
	currentStepCounter.value = Math.ceil(currentStepData.duration - (new Date().getTime() - startExerciseTime.getTime()));

	let listEl:HTMLDivElement = <HTMLDivElement>list.value;
	if(!listEl) return;
	let boundsList = listEl.getBoundingClientRect();
	let cY = window.innerHeight * .35;


	scrollY.value = 0;//Math.round((boundsList.height) * elapsed.value/totalDuration.value);
	// labelPos.value = 160;
	//50 is the padding-top of the list
	//25 is the radius of a step dot
	//160 is the original offset of the center of the first dot on screen
	let pos = Math.round((boundsList.height - 50 - 25) * elapsed.value/totalDuration.value) + 160;
	if(pos < cY) {
		labelPos.value = pos;
	} else {
		scrollY.value = pos - cY;
		labelPos.value = cY;
	}
	// window.scrollBy(0, scrollY.value);

}

/**
 * Oscillator is slow to initialize and start beeping (~500ms)
 * that's why all beeps are pre programmed from the beggining
 * 500ms earlier before they should play so they appear synced
 * with the textual timer
 */
function programBeeps():void {
		//*
		let delay = 0;
		for (let i = 0; i < timings.length; i++) {
			const t = timings[i];
			switch(t.data.id) {
				case "start":
				case "pause":
					if(t.data.id == "pause") {
						beeps.push(setTimeout(async _=> {
							// Beeper.instance.beepPatern([{d:100, f:1000, p:100}, {d:500, f:1000}]);
							Beeper.instance.beepPatern([{d:500, f:1000, p:100}, {d:500, f:1000, p:100}, {d:500, f:1000}]);

						}, delay - 500));
					}else{
						// Beeper.instance.beep(200, 1500);
					}
				
					//Start beeping 5s before pause ends
					if(t.data.duration >= 10000) {
						beeps.push(setTimeout(async _=> {
							// await Beeper.instance.beepPatern([{d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}], .15);
							await Beeper.instance.beepPatern([{d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}]);
						}, Math.max(0,t.data.duration - 5500) + delay));
					}
					break;
					
				case "complete":
					beeps.push(setTimeout(async _=> {
						// Beeper.instance.beepPatern([{d:50, f:1500}, {d:100, f:1800}, {d:50, f:2000}, {d:50, f:2400}, {d:500, f:2800}]);
						Beeper.instance.beepPatern([{d:100, f:1300, p:100}, {d:50, f:1300, p:50}, {d:50, f:1300, p:50}, {d:500, f:1800}]);
					}, delay - 500));
					break;

				default:
					beeps.push(setTimeout(async _=> {
						Beeper.instance.beep(500, 1500, 1, "sine");
					}, delay - 500));
					//Start beeping 5s before end of exercise
					if(t.data.duration > 7000) {
						beeps.push(setTimeout(async _=> {
							await Beeper.instance.beepPatern([{d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}, {d:100, f:1000, p:900}], .15);
						}, Math.max(0,t.data.duration - 5500) + delay));
					}

			}
			delay += t.data.duration;
		}
		//*/

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.timer {
	overflow: hidden;
	height: 100vh;
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
		.inner {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-top: 0px;
			padding-top: 50px;
			position: relative;
	
			&>div{
				&:not(.first-child):not(.arrow) {
					margin-top: -25px;
					color: red;
				}
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

		.arrow {
			position: absolute;
			width: 18px;
			height: 20px;
			right: -16px;
			top: 50%;
			transform: translate(0, -50%);
			img {
				height: 20px;
				width: 18px;
				display: block;
			}
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
<template>
	<div class="confform">
		<h1>Create a routine</h1>
		<form @submit.prevent="onSubmit()" class="form">
			<div class="line">
				<label for="name">Name :</label>
				<input type="text" id="name" placeholder="routine name..." class="input" v-model="name" @keyup.esc="name=null" >
			</div>

			<div class="line">
				<label for="repeatCount">Repeat count :</label>
				<input type="number" id="repeatCount" placeholder="repeat count..." class="input" v-model="loops" @keyup.esc="loops=null" min="0" >
			</div>
			
			<div class="line">
				<label for="pauseDuration">Pause duration :</label>
				<input type="time" id="pauseDuration" placeholder="Pause duration..." class="input" v-model="pauseDuration" @keyup.esc="pauseDuration=null" step="1" min="00:00:00" max="23:59:59" >
			</div>

			<div class="line">
				<label>Exercises :</label>
				<StepLine v-for="(step, index) in steps" :data="step" :key="step.id" class="step" @delete="deleteStep(index)" />
				<Button title="Add exercise" type="button" class="add" white @click="addExercise()" :icon="require('@/assets/icons/plus.svg')" />
			</div>

			<Button title="Start" type="submit" class="submit" :icon="require('@/assets/icons/checkmark_white.svg')" />
		</form>
		<div class="routines" v-if="routines && routines.length > 0">
			<h1>Previous routines</h1>
			<div v-for="r in routines" :key="r.id" class="routine">
				<Button :to="{name:'timer', params:{id:r.id}}" :title="r.name" :icon="require('@/assets/icons/play.svg')" />
				<Button :icon="require('@/assets/icons/delete.svg')" highlight @click="deleteRoutine(r);" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from '../components/Button.vue';
import StepLine from '../components/StepLine.vue';
import RoutineData from '../vo/RoutineData';
import StepData from '../vo/StepData';
import Utils from '../utils/Utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
	components:{
		Button,
		StepLine,
	}
})
export default class ConfForm extends Vue {

	public name:string = "";
	public loops:number = 3;
	public pauseDuration:string|null = "00:01:30";
	public steps:StepData[] = [];

	public get routines():RoutineData[] { return this.$store.state.routines; }

	public mounted():void {
		this.addExercise();
	}

	public beforeDestroy():void {
		
	}

	public onSubmit():void {
		let d = new Date("1/1/1970 "+this.pauseDuration);

		let routine:RoutineData = {
			id:uuidv4(),
			name:this.name,
			loops:this.loops,
			pauseDuration:d.getTime() - d.getTimezoneOffset()*60000,
			steps:this.steps,
		}

		this.$store.dispatch("addRoutine", routine);

		this.$router.push({name:"timer", params:{id:routine.id}});
	}

	public addExercise():void {
		this.steps.push({id:uuidv4()});
	}

	public deleteStep(index:number):void {
		this.steps.splice(index, 1);
	}

	public deleteRoutine(r:RoutineData):void {
		this.$store.dispatch("deleteRoutine", r);
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.confform{
	
	.form {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 50px;
	
		.line {
			// background-color: @mainColor_normal_light;
			border-radius: 30px;
			display: flex;
			flex-direction: column;
			margin-top: 20px;
			width: 100%;
			label {
				width: 250px;
				display: inline-block;
				white-space: nowrap;
				text-align: left;
			}

			input {
				text-align: center;
			}

			.add {
				margin-top: 10px;
				align-self: center;
			}

			.step:not(:last-child) {
				margin-bottom: 15px;
			}
		}

		.submit {
			margin-top: 20px;
		}
	}

	.routines {
		margin-top: 50px;

		.routine {
			display: flex;
			flex-direction: row;
			max-width: 80%;
			margin: auto;
			justify-content: center;
			align-items: center;
			margin-bottom: 10px;
		}
	}
}
</style>
<template>
	<div class="stepline">
		<Button :icon="require('@/assets/icons/cross_white.svg')" class="delete" @click="$emit('delete')" />
		<div class="line">
			<label for="label">Name</label>
			<input type="text" id="label" placeholder="name..." class="input" v-model="exerciseName" @keyup.esc="exerciseName=null" maxlength="100" >
		</div>
		
		<div class="line">
			<label for="exerciseDuration">Duration</label>
			<input type="time" id="exerciseDuration" placeholder="Pause duration..." class="input" v-model="exerciseDuration" @keyup.esc="exerciseDuration=null" step="1" min="00:00:00" max="23:59:59" >
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import StepData from '../vo/StepData';
import Button from './Button.vue';
import Utils from '../utils/Utils';

@Component({
	components:{
		Button,
	}
})
export default class StepLine extends Vue {

	@Prop()
	public data!:StepData;

	public exerciseName:string = "";
	public exerciseDuration:string = "00:02:00";

	public mounted():void {
		this.exerciseName = this.data.name ?? '';
		this.exerciseDuration = Utils.secondsToInputValue(this.data.duration ?? 0);
	}

	public beforeDestroy():void {
		
	}

	@Watch("exerciseName")
	public updateName():void {
		this.data.name = this.exerciseName;
	}

	@Watch("exerciseDuration")
	public updateDuration():void {
		let d = new Date("1/1/1970 "+this.exerciseDuration);
		this.data.duration = d.getTime() - d.getTimezoneOffset()*60000;
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.stepline{
	display: flex;
	justify-content: flex-start;
	flex-direction: column;
	align-items: flex-start;
	background-color: @mainColor_light_light;
	border-radius: 30px;
	padding: 10px;
	position: relative;

	.delete {
		position: absolute;
		right: -15px;
		top: -15px;
	}

	.line {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		&:not(:last-child) {
			margin-bottom: 5px;
		}
		label {
			width: 100px;
			display: block;
			text-align: right;
			padding-right: 10px;
		}
		input {
			flex-grow: 1;
		}
	}
}
</style>
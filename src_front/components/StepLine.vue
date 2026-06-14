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

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import StepData from '../vo/StepData';
import Button from './Button.vue';
import Utils from '../utils/Utils';

const props = defineProps<{
	data:StepData;
}>();

defineEmits(["delete"]);

const exerciseName = ref("");
const exerciseDuration = ref("00:02:00");

onMounted(() => {
	exerciseName.value = props.data.name ?? '';
	exerciseDuration.value = Utils.secondsToInputValue(props.data.duration ?? 0);
});

watch(exerciseName, () => {
	props.data.name = exerciseName.value;
});

watch(exerciseDuration, () => {
	let d = new Date("1/1/1970 "+exerciseDuration.value);
	props.data.duration = d.getTime() - d.getTimezoneOffset()*60000;
});
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
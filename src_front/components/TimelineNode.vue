<template>
	<div class="timelinenode">
		<div class="pin" v-if="data.type=='node'">
			<span class="label">{{data.label}}</span>
		</div>

		<div class="path" v-if="data.type=='path'" :style="styles">
			<img src="@/assets/icons/pin.svg" class="img">
			<div class="back"></div>
			<div class="line"></div>
			<img src="@/assets/icons/pin_red.svg" class="img" v-if="data.isLast">
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Config from "../utils/Config";
import NodeData from "../vo/NodeData";

@Component({
	components:{}
})
export default class TimelineNode extends Vue {

	@Prop()
	public data!:NodeData;

	public get styles():any {
		return {
			height:((this.data.duration? this.data.duration : 1000) * Config.TIME_RENDER_RATIO)+"px"
		}
	}

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.timelinenode{
	.pin {
		color: white;
		font-family: "Futura", Helvetica, Arial, sans-serif;
		font-weight: bold;
		font-size: 30px;
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 50px;
		height: 50px;

		.label {
			text-align: left;
			position: absolute;
			width: 300px;
			max-width: 40vw;
			margin-left: 60px;
		}
	}

	.path {
		position: relative;
		display: block;
		width: 50px;

		.back {
			background-color: #e0f5f9;
			width: 15px;
			height: 100%;
			margin: auto;
		}

		.line {
			background-color: #ffffff;
			height: 100%;
			width: 2px;
			height: calc(100% - 15px);
			display: block;
			margin: auto;
			z-index: 1;
			top: 0;
			left: 50%;
			transform: translate(-50%, 0);
			position: absolute;
		}

		.img {
			width: 50px;
			height: 50px;
			position: absolute;
			transform: translate(-50%, -50%);
		}
	}
}

@media only screen and (max-width: 500px) {
	.timelinenode{
		.pin {
			.label {
				font-size: 30px;
			}
		}

	}
}
</style>
<template>
	<component
	:class="classes"
	:is="nodeType"
	:type="type=='checkbox'? null : type"
	:target="target"
	:to="to"
	:data-selected="selected"
	@click="onClick()"
	:style="progressStyle">
		<img :src="parsedIcon" v-if="parsedIcon" alt="icon" class="icon" :class="loading? 'hide' : 'show'">
		<!--
			<img v-if="loading &&  white !== false" src="@/assets/loader/loader_light.svg" alt="icon" class="spinner">
			<img v-if="loading && white === false" src="@/assets/loader/loader_white.svg" alt="icon" class="spinner">
		-->
		<img v-if="loading" src="@/assets/loader/loader_white.svg" alt="icon" class="spinner">
		<span class="label" :class="loading? 'hide' : 'show'" v-if="title" v-html="title"></span>
		<input type="file" v-if="type=='file'" class="browse" accept=".zip" ref="browse" @change="$emit('change', $event)" />
		<input type="checkbox" :name="name" :id="name" class="checkbox" ref="checkbox" v-model="checked" v-if="type=='checkbox'" />
	</component>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import gsap from 'gsap';
import checkmarkIcon from '@/assets/icons/checkmark.svg';

const props = withDefaults(defineProps<{
	icon?:string;
	iconSelected?:string;
	title?:string;
	name?:string;
	loading?:boolean;
	type?:string;
	target?:string;
	to?:any;
	percent?:number;
	white?:boolean;
	big?:boolean;
	highlight?:boolean;
	selected?:boolean;
	disabled?:boolean;
	modelValue?:boolean;
}>(), {
	loading: false,
	type: "button",
	to: null,
	percent: -1,
	white: false,
	big: false,
	highlight: false,
	selected: false,
	disabled: false,
	modelValue: false,
});

const emit = defineEmits(["click", "change", "update:modelValue"]);

const pInterpolated = ref(-1);
const checked = ref(false);
const browse = ref<HTMLInputElement|null>(null);

const nodeType = computed<string>(() => {
	if(props.to) return "router-link";
	if(props.type == "checkbox") return "div";
	return "button";
});

const parsedIcon = computed<string|undefined>(() => {
	if(props.type == "checkbox" && props.modelValue) {
		return checkmarkIcon;
	}
	if(props.selected !== false && props.iconSelected) {
		return props.iconSelected;
	}else{
		return props.icon;
	}
});

const progressStyle = computed<any>(() => {
	if(pInterpolated.value> -1 && pInterpolated.value<100) {
		let p:number = Math.round(pInterpolated.value);
		let color = "255, 255, 255";
		let alpha = .5;
		if(props.white) {
			color = "75, 201, 194"
			alpha = .3;
		}
		return {backgroundImage: "linear-gradient(to right, rgba("+color+",0) "+p+"%,rgba("+color+",0) "+p+"%,rgba("+color+","+alpha+") "+p+"%,rgba("+color+","+alpha+") 100%)"};
	}else{
		return {};
	}
});

const classes = computed<any>(() => {
	let list =  ["button"]
	if(!props.title) list.push("noTitle");
	if(props.white !== false) list.push("white");
	if(props.big !== false) list.push("big");
	if(props.highlight !== false) list.push("highlight");
	if(props.selected !== false) list.push("selected");
	if(props.loading !== false) list.push("disabled");
	if(props.disabled !== false) list.push("disabled");
	if(props.type == "checkbox") list.push("checkbox");
	return list;
});

onMounted(() => {
	checked.value = props.modelValue;
});

function resetBrowse():void {
	if(browse.value) browse.value.value = "";
}

function onClick():void {
	emit('click');//bubble up event to avoid having to listen for @click.native everytime
}

watch(checked, () => {
	emit('update:modelValue', checked.value);
});

watch(() => props.percent, () => {
	let duration = props.percent < pInterpolated.value? 0 : .35;
	gsap.killTweensOf(pInterpolated);
	gsap.to(pInterpolated, {duration, value:props.percent, ease:"sine.inout"});
});

defineExpose({ resetBrowse });
</script>

<style lang="less" scoped>
@import (reference) '../less/_includes.less';
.button {
	position: relative;//Necessary for loader spinning absolute placement
	display: inline-flex;
	// width: 100%;
	// height: 100%;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	white-space: nowrap;
	transition: all .25s;
	overflow: hidden;

	&.noTitle {
		margin: 0;
		padding: 7px;
		.icon {
			height: 100%;
			max-height: 26px;
			margin: 0;
			padding: 0;
		}

		&.big {
			padding: 19px;
			.icon {
				min-width: 40px;
				max-height: 40px;
			}
		}
	}

	&.checkbox {
		background: none;
		border: 1px solid @mainColor_normal;
		border-radius: 7px;
		padding: 0px;
		width: 25px;
		height: 25px;
		cursor: pointer;

		.checkbox {
			opacity: .001;
			position: absolute;
			padding: 0;
			margin: 0;
			width: 100%;
			height: 100%;
			cursor: pointer;
		}
		.icon {
			width: 70%;
		}
		&:hover {
			background-color: @mainColor_normal_extralight;
		}
	}

	.icon {
		// max-height: 20px;
		width: 20px;
		margin-right: 10px;
		vertical-align: middle;
	}

	.spinner {
		.center;
		position: absolute;
		vertical-align: middle;
		height: 25px;
		width: 25px;
	}

	.label {
		flex-grow: 1;
		white-space: nowrap;
	}

	.label, .icon {
		opacity: 1;
		transition: opacity .2s;
		&.hide {
			opacity: .25;
		}
	}

	.browse {
		opacity: 0;
		position: absolute;
		z-index: 0;
		left: 0;
		width: 100%;
		height: 200%;//Hack to avoid browse button from locking cursor:pointer by putting it out of button's bounds
		cursor: pointer;
		font-size: 0px;
	}

	&.white {
		color: @mainColor_normal;
		background-color: @mainColor_light_light;
		.label, .icon {
			&.hide {
				opacity: .4;
			}
		}
		&:not(.loading):hover {
			background-color: @mainColor_light_extralight;
		}
		&.loading {
			background-color: fade(#ffffff, 50%);
		}
	}

	&.big {
		padding: 20px;
		border-radius: 50px;
		.label {
			font-size: 30px;
		}
		.icon {
			min-width: 30px;
			min-height: 30px;
		}
	}

	&.highlight {
		background-color: @mainColor_warn;
		.label, .icon {
			&.hide {
				opacity: .4;
			}
		}
		&:not(.loading):hover {
			background-color: @mainColor_warn_light;
		}
		&.loading {
			background-color: fade(@mainColor_warn, 50%);
		}
		&.selected {
			background-color: @mainColor_warn_extralight;
		}
	}

	&.selected:not(.highlight) {
		background-color: @mainColor_highlight;
		color: #fff;
		&:hover {
			background-color: fade(@mainColor_normal_light, 50%);
		}
	}
	&.small {
		padding: 5px 10px;
		border-radius: 7px;
		font-size: 14px;
		text-transform: none;
	}
	
	&.disabled {
		opacity: .15;
		color: #fff;
	}
	
	&.cancel {
		background-color: #ccc;
		&:hover {
			background-color: #ddd;
		}
	}
}

@media only screen and (max-width: 500px) {
	.button {
		&.noTitle.big, &.big {
			padding: 12px;
			border-radius: 50px;
			.label {
				font-size: 25px;
			}
			.icon {
				min-width: 25px;
				min-height: 25px;
			}
		}
	}
}
</style>
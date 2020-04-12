<template>
	<div id="app" class="app">
	    <router-view/>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Beeper from './utils/Beeper';

@Component({
	components:{}
})
export default class App extends Vue {

	public mounted():void {
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
.app{
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	width: 450px;
	margin: auto;
}
</style>
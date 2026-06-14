import { createStore } from 'vuex'
import RoutineData from '../vo/RoutineData'

export default createStore({
  state: {
	  routines: [] as RoutineData[]
  },

  mutations: {
	addRoutine(state, payload:RoutineData) {
		state.routines.push(payload);
		localStorage.setItem("data", JSON.stringify(state.routines));
	 },
	 deleteRoutine(state, payload:RoutineData) {
		for (let i = 0; i < state.routines.length; i++) {
			const routine = state.routines[i];
			if(payload.id == routine.id) {
				state.routines.splice(i, 1);
			}
		}
		localStorage.setItem("data", JSON.stringify(state.routines));
	  },
	 loadFromLS(state) {
		 let d = localStorage.getItem("data");
		 if(d) {
			 state.routines = JSON.parse(d);
		 }
	 }
  },

  actions: {
	addRoutine({commit}, payload) { commit("addRoutine", payload); },
	deleteRoutine({commit}, payload) { commit("deleteRoutine", payload); },
	loadFromLS({commit}) { commit("loadFromLS"); },
  },

  modules: {
  }
})

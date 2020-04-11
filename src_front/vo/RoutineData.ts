import StepData from './StepData';

export default interface RoutineData {
	id:string;
    name?:string;
    loops?:number;
    pauseDuration?:number;
    steps?:StepData[];
}
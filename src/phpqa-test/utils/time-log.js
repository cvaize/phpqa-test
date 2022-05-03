module.exports = function timeLog(label){
    console.time(label);
    console.log(label+'...')
    return function (){
        console.timeEnd(label);
    }
}
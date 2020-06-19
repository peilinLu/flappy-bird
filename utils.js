/**
 * 
 * @param {*} eleName 需要创建的元素
 * @param {*} classArr  元素的类名，是一个数组，有可能有多个类名
 * @param {*} styleObj  元素的样式，是一个对象，样式书写恰好是一个个键值对
 */
function createEle(eleName,classArr,styleObj){
    var dom = document.createElement(eleName);
    for(var i = 0;i < classArr.length;i++){
        dom.classList.add(classArr[i]);
    }

    for(var key in styleObj){
        dom.style[key] = styleObj[key];
    }

    return dom;
 };


/**
 * Web Storage     localStorage
 * @param {*} key 
 * @param {*} value 
 */
 function setLocal(key,value){
     if(typeof value === 'object' && value !== null){
        value =JSON.stringify(value);
     }
     localStorage.setItem(key,value);
 }

 function getLocal(key){
     value = localStorage.getItem(key);
     //如果键值不存在等于null，直接return回去，不往下执行了
     if(value === null){return value};
     if(value[0]==='{' || value[0]==='['){
         return JSON.parse(value);
     }
     return value;
 }
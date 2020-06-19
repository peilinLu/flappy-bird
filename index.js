//对象收编变量


var bird = {
    SkyPosition:0,
    skyStep:2, //默认初始为2 ，更改可变速度
    birdTop:220,
    birdStepY:0,    //小鸟下落
    startColor:'blue',
    animateFlag:false, //锁
    minTop:0,
    maxTop:570, //因为小鸟自身也有30px
    pipeLength:5,  //有多少组柱子
    pipeArr:[],    //存上下柱子的信息
    score:0,
    pipeLastIndex:4,  //最后一根柱子索引
    /**
     * 初始化函数
     */
    init:function(){
        this.initdata();
        this.animate();
        this.handle();

        if(sessionStorage.getItem('play')){
            this.start();
        }
    },

    initdata:function(){
        this.el = document.getElementById('game');
        this.obird = this.el.getElementsByClassName('bird')[0];
        this.ostart = this.el.getElementsByClassName('start')[0];
        this.oscore = this.el.getElementsByClassName('score')[0];
        this.omask = this.el.getElementsByClassName('mask')[0];
        this.oend = this.el.getElementsByClassName('end')[0];
        this.ofinalScore = this.oend.getElementsByClassName('final-score')[0];
        this.oranklist = this.oend.getElementsByClassName('rank-list')[0];
        this.orestart = this.oend.getElementsByClassName('restart')[0];

        this.scoreArr = this.getScore();  //创建一个scoreArr数组，数组中存的是一个一个对象，对象存的是当前排名的信息
    },
    getScore:function(){
        var scoreArr = getLocal('score'); //键值不存在 值为null
        //判断scoreArr是否为真值，如果没有返回一个空数组;
        return scoreArr ? scoreArr : [];
    },

    //animate 去管理所有动画函数
    animate:function(){
        //this === bird
        var self =this;
        var count = 0; //计数器
        this.timer = setInterval(function(){
            //this === window
            self.skyMove();
            if(self.animateFlag){
                self.pipeMove();
            }

            if(self.animateFlag){
                self.birdDrop();
            }
            //因为birdJump和clickStart函数需要300毫秒才执行一次
            if(++ count % 10 === 0){
                if(!self.animateFlag){
                    self.birdJump();
                    self.clickStart();
                }
                
                self.birdFly(count);
            }
            
        },30)
        
        
        
    },
    /**
     * 天空动
     */
    skyMove:function(){
            this.SkyPosition -= this.skyStep;
            this.el.style.backgroundPositionX= this.SkyPosition +'px';
    },
    /**
     * 柱子移动 + 不停添加柱子
     */
    pipeMove:function(){
        for(var i=0;i<this.pipeLength;i++){
            var oUpPipe = this.pipeArr[i].up;
            var oDownPipe = this.pipeArr[i].down; 
            var x = oUpPipe.offsetLeft - this.skyStep;   //得到柱子离document的左距离，再减去和天空用同一个skyStep的数值

            //逻辑思路为：如果柱子的移动值x已经小于了-52px(一个柱子宽度),那就把第一根柱子索引为0的放在离最后一根的300px后面，
            //然后再把最后一根柱子索引值自身加1 除于 柱子总数 例如: ++6 % 7 =0,此时最后一根变为0了，由此循环
            if(x < -52){
                var lastPipeLeft = this.pipeArr[this.pipeLastIndex].up.offsetLeft;
                oUpPipe.style.left = lastPipeLeft + 300 +'px';
                oDownPipe.style.left = lastPipeLeft + 300 + 'px'
                this.pipeLastIndex = ++this.pipeLastIndex % this.pipeLength;


                continue;
            }
            oUpPipe.style.left = x +'px';
            oDownPipe.style.left = x +'px'; 
        }
    },
    // getPipeHeight:function(){
    //     var upHeight =50 + Math.floor(Math.random()*175);
    //     var downHeight = 600 - 150 - upHeight;
    //     return{
    //         upH:upHeight,
    //         downH:downHeight,
    //     } 
    // },
    /**
     * 小鸟上下跳跃
     */
    birdJump:function(){
            //判断一下birdTop值是否等220，如果是就变260否则220 ，判断出来的值然后再赋值回birdTop
            this.birdTop = this.birdTop === 220 ? 260 : 220; 
            this.obird.style.top = this.birdTop + 'px';
    },
    /**
     * 小鸟下落
     */
    birdDrop:function(){
       this.birdTop += ++ this.birdStepY;
       this.obird.style.top = this.birdTop + 'px';
       this.judgeKnock();
       this.addScore();
    },
    /**
     * 小鸟煽动翅膀
     */
    birdFly:function(count){
        this.obird.style.backgroundPositionX = count % 3 * -30 + 'px';
    },
    /**
     * 点击开始动画
     */
    clickStart:function(){
        //先拿到一开始的颜色
        var prevColor = this.startColor;
        //然后进行判断再重新赋值
        this.startColor = prevColor === "blue" ? "while" : "blue";
        //操作dom，页面显示
        this.ostart.classList.remove('start-' + prevColor);
        this.ostart.classList.add('start-'+ this.startColor);

    },
    /**
     * 碰撞检测
     */
    judgeKnock:function(){
        this.judgeBoundary();
        this.judgePipe();
    },
    /**
     * 边界碰撞检测
     */
    judgeBoundary:function(){
        if(this.birdTop < this.minTop || this.birdTop >this.maxTop){
            this.failGame();
        }
    },
    /**
     * 柱子碰撞检测
     */
    judgePipe:function(){
        //鸟与柱子相遇条件  pipex = 95 pipex=13 看图示1，2;  pipex指一对柱子距离左边的值
        //鸟与柱子相撞条件  pipey = birdtop 小于 上柱子的高度 并且 birdtop 大于 上柱子高度加150
        var index = this.score % this.pipeLength; //穿过了第几组柱子刚好可取决于分数
        var pipeX = this.pipeArr[index].up.offsetLeft; //拿到上柱子的left值就拿到了一对
        var pipeY = this.pipeArr[index].y;   
        var birdY = this.birdTop;
        if((pipeX <= 95 && pipeX >= 13) && (birdY <= pipeY[0] || birdY >= pipeY[1])){
            this.failGame();
        }
    },
    /**
     * 分数变化
     */
    addScore:function(){
        var index = this.score % this.pipeLength;
        var pipeX = this.pipeArr[index].up.offsetLeft;
        if(pipeX < 13){
            this.oscore.innerText = ++ this.score;
        }
    },

    /**
     * 处理事件
     */
    handle:function(){
        this.handleStart();
        this.handleClick();
        this.handleRestart();
    },
    //点击开始游戏后的事件
    handleStart:function(){
        
        this.ostart.onclick=this.start.bind(this);
    },
    start:function(){
        var self = this;
            self.animateFlag = true;
            self.ostart.style.display= 'none';
            self.oscore.style.display = 'block';
            self.obird.style.left = '80px';
            //天空加速
            self.skyStep = 5;
            //小鸟完蛋下落的时候把过渡去掉
            self.obird.style.transition = 'none';  
            //开始游戏后调用创建柱子函数
            for(var i = 0;i<self.pipeLength;i++){
                //函数里的参数x为每个柱子的left值
                self.createPipe(300 * (i+1));
            }       
        
    },
    //点击屏幕小鸟向上蹦事件
    handleClick:function(){
        var self =this;
        this.el.onclick=function(e){
            if(!e.target.classList.contains('start')){
                self.birdStepY = -10;
            }   
        }
    },
    //重新开始
    handleRestart:function(){
        this.orestart.onclick = function(){
            sessionStorage.setItem('play',true);
            window.location.reload();
        }    
    },

    /**
     * 创建柱子函数
     */
    createPipe:function(x){
        //思路：上，下柱子的高度是随机的，最小高度不得小于50px,中间的宽是固定的150
        // pipe的高度等于 600-150=450  450/2=225
        // (0,1) * 175 = (0,175)
        //但最小高度为50px ,所以先加上50，每根柱子固定随机高度为(0,255),50+225就超出高度了，所以*175
        var upHeight =50 + Math.floor(Math.random()*175);
        var downHeight = 600 - 150 - upHeight;
        

        var oUpPipe=createEle("div",['pipe','pipe-up'],{
            height:upHeight + 'px',
            left: x + 'px',
        })
        var oDownPipe = createEle('div',['pipe','pipe-bottom'],{
            height:downHeight+'px',
            left : x + 'px',
        })

        //把上下柱子的信息传进一个数组里
        this.pipeArr.push({
            up:oUpPipe,
            down:oDownPipe,
            y:[upHeight,upHeight + 150],
        })

        this.el.appendChild(oUpPipe);
        this.el.appendChild(oDownPipe);
    },


    setScore:function(){
        this.scoreArr.push({
            score:this.score,
            time:this.getData(),
        })
        //分数排序
        this.scoreArr.sort(function(a,b){
            return b.score - a.score;
        })

        setLocal('score',this.scoreArr)
        // console.log(this.scoreArr);
    },
    getData:function(){
        var d = new Date();
        var year = this.formarNum(d.getFullYear());
        var month = this.formarNum(d.getMonth() + 1);
        var data = this.formarNum(d.getDate());
        var hour = this.formarNum(d.getHours());
        var minute = this.formarNum(d.getMinutes());
        var second = this.formarNum(d.getSeconds());

        return `${year}.${month}.${data} ${hour}:${minute}:${second}`;
    },
    //如果数字为个位，变为'06'这样的格式
    formarNum:function(num){
        if(num < 10){
            return '0'+num;
        }
        return num;
    },

    /**
     * gameout 
     */
    failGame:function(){
        clearInterval(this.timer);
        this.setScore();
        this.omask.style.display='block';
        this.oend.style.display='block';
        this.obird.style.display='none';
        this.oscore.style.display='none';
        this.ofinalScore.innerText = this.score;
        this.renderRankList();
    },

    renderRankList:function(){
        var template = '';
        for(var i = 0;i < 8;i++){
            var degreeClass = '';
            switch(i){
                case 0:
                    degreeClass = 'first';
                    break;
                case 1:
                    degreeClass = 'second';
                    break;
                case 2:
                    degreeClass = 'third';
                    break;
            }

            template += `
                <li class="rank-item">
                    <span class="rank-degree ${degreeClass}">${i+1}</span>
                    <span class="rank-score">${this.scoreArr[i].score}</span>
                    <span class="rank-time">${this.scoreArr[i].time}</span>
                </li>
            `
        }
        this.oranklist.innerHTML = template;
    }

};

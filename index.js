//对象收编变量

//animate 去管理所有动画函数
var bird = {
    SkyPosition:0,
    skyStep:2, //默认初始为2 ，更改可变速度
    birdTop:220,
    birdStepY:0,    //小鸟下落
    startColor:'blue',
    animateFlag:false, //锁
    minTop:0,
    maxTop:570, //因为小鸟自身也有30px
    /**
     * 初始化函数
     */
    init:function(){
        this.initdata();
        this.animate();
        this.handle();
    },

    initdata:function(){
        this.el = document.getElementById('game');
        this.obird = this.el.getElementsByClassName('bird')[0];
        this.ostart = this.el.getElementsByClassName('start')[0];
        this.oscore = this.el.getElementsByClassName('score')[0];
        this.omask = this.el.getElementsByClassName('mask')[0];
        this.oend = this.el.getElementsByClassName('end')[0];
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
       this.collisionChecking();
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

    collisionChecking:function(){
        this.edgeDetect();
        this.columnDetect();
    },
    /**
     * 边界碰撞检测
     */
    edgeDetect:function(){
        if(this.birdTop < this.minTop || this.birdTop >this.maxTop){
            this.failGame();
        }
    },
    /**
     * 柱子碰撞检测
     */
    columnDetect:function(){},

    /**
     * 处理事件
     */
    handle:function(){
        this.handleStart();
    },

    handleStart:function(){
        var self = this;
        this.ostart.onclick=function(){
            self.animateFlag = true;
            self.ostart.style.display= 'none';
            self.oscore.style.display = 'block';
            self.obird.style.left = '80px';
            //天空加速
            self.skyStep = 5;
        }
    },

    failGame:function(){
        clearInterval(this.timer);
        this.omask.style.display='block';
        this.oend.style.display='block';
        this.obird.style.display='none';
        this.oscore.style.display='none';
    }
};

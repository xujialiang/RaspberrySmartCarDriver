// 在树莓派上，启动SmartCarDriver。 建议加入系统自启动。 需要用root权限，或者把pi用户加入到gpio用户组。

const ezPWM = require('ezpwmforraspberry');
const rpio = require('rpio');
const SBUSUART = require('sbusuart')
const SBUS = new SBUSUART();
const MotorManager = require('ezmotor');
const motorMgr = new MotorManager();
const EZX750 = require('ezx750ups');
let ezX750Mgr = new EZX750(0x36);

class SmartCarDriver {

    constructor(){
        // MC10遥控，行程最小200， 最大1800。
        SBUS.setupConvertParams(200, 1800);
        
        // 定义轮子
        this.rightFront = motorMgr.motorFactory(18, 22, ezPWM.PWMPin.PIN12); //右前轮
        this.leftFront = motorMgr.motorFactory(31, 29, ezPWM.PWMPin.PIN12);  //左前轮
        this.rightBack = motorMgr.motorFactory(15, 16, ezPWM.PWMPin.PIN12);  //右后轮
        this.leftBack = motorMgr.motorFactory(13, 11, ezPWM.PWMPin.PIN12);   //左后轮
        motorMgr.setupMotors(this.leftFront, this.rightFront, this.leftBack, this.rightBack); // 设置前后左右轮子
        console.log('motors', motorMgr.getAllMotors());
    }

    _getStatus(){
        let vol = ezX750Mgr.getVoltage();
        console.log('vol', vol);


        let cap = ezX750Mgr.getCapacity();
        console.log('cap', cap);
    }

    start(){
        let that = this;
        SBUS.start('/dev/ttyAMA0', (status, channels, channels_c)=>{
            that._processSpeedAndDirection(status, channels, channels_c);
        });
    }

    _processSpeedAndDirection(status, channels_origin, channels_convert){
        // 处理各个通道数据, 通过Promise异步处理
            // 通道1:右手左右;    控制左右方向
            // 通道2:左手上下;  
            // 通道3:右手上下;    油门 + -, 如果通道1有指令向左右，则按通道1方向。 如果通道1没有设置左右方向，则按默认向前或向后。
            // 通道4:左手左右;    // 向左右旋转 或斜着前进后退(SW4控制)
            // 通道5:SW1;       三段式开关
            // 通道6:SW2;       打开关闭小车动力，电机上电或关闭
            // 通道7:SW3;       打开关闭GPS
            // 通道8:SW4;       左遥感 控制向左向右旋转 或者控制斜线前进后退
            // 通道9:RV左;      云台左右
            // 通道10:RV右;     云台上下 
        console.log('油门', new Date(),status, channels_origin[2], channels_convert[2]);
        console.log('右手左右', new Date(),status, channels_origin[0], channels_convert[0]);
        console.log('左手手左右', new Date(),status, channels_origin[3], channels_convert[3]);
        console.log('SW4', new Date(),status, channels_origin[7], channels_convert[7]);
        if(channels_origin[2] == 0 || channels_convert[2] == 0 || channels_origin[2] == 200) {
            return;
        }
        if(status==0){
            const diff = channels_convert[2] - 0.5;
            var diff_abs = Math.abs(diff);
            if(diff_abs>=0.1){
                // 控制油门速度
                if(diff_abs > 0.5){
                    diff_abs = 0.5;
                }
                const percent = parseInt(diff_abs*2*100);
                console.log('percent', percent);
                motorMgr.updateSpeed(percent, this.leftFront);

                //向右转 向左转 或者斜着方向。 左遥感优先级高于右遥感
                const diff_leftright_lefthand = channels_convert[3] - 0.5;
                var diff_leftright_lefthand_abs = Math.abs(diff_leftright_lefthand);

                const sw4val = channels_convert[7];
                if(diff_leftright_lefthand_abs>=0.25){
                    if(sw4val>0){
                        console.log('sw4val>0');
                        // sw4val 开关 打开， 左手遥控智能左右旋转
                        if(diff_leftright_lefthand>0){
                            motorMgr.turnRight();
                        }else{
                            motorMgr.turnLeft();
                        }
                        return;
                    }else{
                        console.log('sw4val<=0');
                        // sw4val 开关 关闭， 左手遥感控制左前 右前 左后 右后方向
                        if(diff>0){
                            if(diff_leftright_lefthand>0){
                                //右前
                                console.log('右前');
                                motorMgr.doRightFront();
                            }else{
                                //左前
                                console.log('左前');
                                motorMgr.doLeftFront();
                            }
                        }else{
                            if(diff_leftright_lefthand>0){
                                //右后
                                console.log('右后');
                                motorMgr.doRightBack();
                            }else{
                                //左后
                                console.log('左后');
                                motorMgr.doLeftBack();
                            }
                        }
                        return;
                    }
                    
                }

                // 判断是否有左右, 如果是左右，优先级高于前后
                const diff_leftright = channels_convert[0] - 0.5;
                var diff_leftright_abs = Math.abs(diff_leftright);
                if(diff_leftright_abs>=0.25){
                    // 控制左右方向
                    if(diff_leftright>0){
                        motorMgr.doRight();
                        return;
                    }else{
                        motorMgr.doLeft();
                        return;
                    }
                }else{
                    // 控制前后方向
                    if(diff>0){
                        console.log('向前');
                        motorMgr.doForward();
                        return;
                    }else{
                        console.log('向后');
                        motorMgr.doBackward();
                        return;
                    }
                }
                
            }else{
                motorMgr.updateSpeed(0);
            }
        }else{

        }
    }

}

new SmartCarDriver().start();
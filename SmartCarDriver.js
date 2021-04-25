// 在树莓派上，启动SmartCarDriver。 建议加入系统自启动。 需要用root权限，或者把pi用户加入到gpio用户组。

const ezTB6612 = require('eztb6612')
const ezPWM = require('ezpwmforraspberry');
const rpio = require('rpio');
const SBUSUART = require('sbusuart')
const SBUS = new SBUSUART();
const MotorFront = new ezTB6612();
const MotorBack = new ezTB6612();

class SmartCarDriver {

    constructor(){
        // MC10遥控，行程最小200， 最大1800。
        SBUS.setupConvertParams(200, 1800);

        // 用12号端口控制速度, 连接了T6612驱动模块上的PWM信号口，向它发送信号，控制速度。
        MotorFront.setupMotor1SpeedConfig(ezPWM.PWMPin.PIN12);
        MotorFront.setupMotor2SpeedConfig(ezPWM.PWMPin.PIN12);
        // MotorFront和Motorback的pwm都连了PIN12，小车四个轮子速度一致。
        MotorBack.setupMotor1SpeedConfig(ezPWM.PWMPin.PIN12);
        MotorBack.setupMotor2SpeedConfig(ezPWM.PWMPin.PIN12);

        // 定义轮子
        MotorFront.setupMotor1Config(18, 22); //右前轮
        MotorFront.setupMotor2Config(31, 29); //左前轮

        MotorBack.setupMotor1Config(15, 16); //右后轮
        MotorBack.setupMotor2Config(13, 11); //左后轮
    }

    start(){
        let that = this;
        SBUS.start('/dev/ttyAMA0', (status, channels, channels_c)=>{
            // 处理各个通道数据, 通过Promise异步处理
            // 通道1:右手左右;    控制左右方向
            // 通道2:左手上下;  
            // 通道3:右手上下;    油门 + -, 如果通道1有指令向左右，则按通道1方向。 如果通道1没有设置左右方向，则按默认向前或向后。
            // 通道4:左手左右;  
            // 通道5:SW1;       三段式开关
            // 通道6:SW2;       打开关闭小车动力，电机上电或关闭
            // 通道7:SW3;       打开关闭GPS
            // 通道8:SW4;       打开关闭啥？
            // 通道9:RV左;      云台左右
            // 通道10:RV右;     云台上下 
            console.log('油门', new Date(),status, channels[2], channels_c[2]);

            that._processSpeedAndDirection(status, channels[2], channels_c[2]);
            
        });
    }

    _processSpeedAndDirection(status, channel_origin, channel_convert){
        if(channel_origin == 0 || channel_convert == 0 || channel_origin == 200) {
            return;
        }
        if(status==0){
            const diff = channel_convert - 0.5;
            const diff_abs = Math.abs(diff);
            if(diff_abs>0.1){
                // 控制速度
                if(diff_abs > 0.5){
                    diff_abs = 0.5;
                }
                const percent = parseInt(diff_abs*2*100);
                console.log('percent', percent);

                MotorFront.updateMotor1Speed(percent);

                // 控制方向
                if(diff>0){
                    console.log('向前');
                    MotorFront.doAllForward()
                    MotorBack.doAllForward()
                }else{
                    console.log('向后');
                    MotorFront.doAllBackward()
                    MotorBack.doAllBackward()
                }
            }else{
                MotorFront.updateAllMotorSpeed(0);
            }
        }else{

        }
    }

}

new SmartCarDriver().start();